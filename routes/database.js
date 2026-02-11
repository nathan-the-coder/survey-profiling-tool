const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

class DatabaseAdapter {
    constructor() {
        this.environment = process.env.NODE_ENV || 'development';
        this.useSupabase = this.environment === 'production';
        this.supabaseClient = null;
        this.mysqlPool = null;
        
        this.initializeConnection();
    }

    initializeConnection() {
        if (this.useSupabase) {
            // Production: Use Supabase
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
            
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase credentials not found in environment variables');
            }
            
            this.supabaseClient = createClient(supabaseUrl, supabaseKey);
            console.log('🟢 Connected to Supabase (Production)');
        } else {
            // Development: Use MySQL
            this.mysqlPool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'survey_profiling',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            console.log('🔵 Connected to MySQL (Development)');
        }
    }

    // Search participants method
    async searchParticipants(query, userRole, userParish) {
        try {
            if (this.useSupabase) {
                // Supabase implementation
                let supabaseQuery = this.supabaseClient
                    .from('family_members')
                    .select(`
                        id,
                        full_name,
                        relation_to_head_code,
                        purok_gimong,
                        barangay_name,
                        households!inner(
                            parish_name
                        )
                    `)
                    .or(`full_name.ilike.%${query}%,purok_gimong.ilike.%${query}%,barangay_name.ilike.%${query}%`);

                // Apply role-based filtering
                if (userRole === 'parish' && userParish) {
                    supabaseQuery = supabaseQuery.eq('households.parish_name', userParish);
                }

                const { data, error } = await supabaseQuery.limit(20);
                
                if (error) throw error;
                return data;
            } else {
                // MySQL implementation
                let sql = `
                    SELECT 
                        fm.id,
                        fm.full_name,
                        fm.relation_to_head_code,
                        fm.purok_gimong,
                        fm.barangay_name
                    FROM family_members fm
                    INNER JOIN households h ON fm.household_id = h.id
                    WHERE fm.full_name LIKE ? 
                       OR fm.purok_gimong LIKE ?
                       OR fm.barangay_name LIKE ?
                `;
                
                const params = [`%${query}%`, `%${query}%`, `%${query}%`];
                
                // Apply role-based filtering
                if (userRole === 'parish' && userParish) {
                    sql += ' AND h.parish_name = ?';
                    params.push(userParish);
                }
                
                sql += ' LIMIT 20';
                
                const [rows] = await this.mysqlPool.execute(sql, params);
                return rows;
            }
        } catch (error) {
            console.error('Error searching participants:', error);
            throw error;
        }
    }

    // Get participant details
    async getParticipantDetails(participantId, userRole, userParish) {
        try {
            if (this.useSupabase) {
                // Supabase implementation
                // Get household info
                const { data: household, error: householdError } = await this.supabaseClient
                    .from('households')
                    .select('*')
                    .eq('id', participantId)
                    .single();

                // Get family members
                const { data: familyMembers, error: familyError } = await this.supabaseClient
                    .from('family_members')
                    .select('*')
                    .eq('household_id', participantId);

                // Get health conditions
                const { data: healthConditions, error: healthError } = await this.supabaseClient
                    .from('health_conditions')
                    .select('*')
                    .eq('household_id', participantId)
                    .single();

                // Get socio-economic data
                const { data: socioEconomic, error: socioError } = await this.supabaseClient
                    .from('socio_economic')
                    .select('*')
                    .eq('household_id', participantId)
                    .single();

                if (householdError || familyError || healthError || socioError) {
                    throw new Error('Error fetching participant details');
                }

                return {
                    household,
                    family_members: familyMembers,
                    health_conditions: healthConditions,
                    socio_economic: socioEconomic,
                    userRole,
                    userParish
                };
            } else {
                // MySQL implementation
                const [householdRows] = await this.mysqlPool.execute(
                    'SELECT * FROM households WHERE id = ?', [participantId]
                );
                const [familyRows] = await this.mysqlPool.execute(
                    'SELECT * FROM family_members WHERE household_id = ?', [participantId]
                );
                const [healthRows] = await this.mysqlPool.execute(
                    'SELECT * FROM health_conditions WHERE household_id = ?', [participantId]
                );
                const [socioRows] = await this.mysqlPool.execute(
                    'SELECT * FROM socio_economic WHERE household_id = ?', [participantId]
                );

                return {
                    household: householdRows[0] || {},
                    family_members: familyRows,
                    health_conditions: healthRows[0] || {},
                    socio_economic: socioRows[0] || {},
                    userRole,
                    userParish
                };
            }
        } catch (error) {
            console.error('Error getting participant details:', error);
            throw error;
        }
    }

    // Test connection method
    async testConnection() {
        try {
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('households')
                    .select('id')
                    .limit(1);
                
                if (error) throw error;
                return { success: true, database: 'Supabase', sample: data };
            } else {
                const [rows] = await this.mysqlPool.execute('SELECT 1 as test');
                return { success: true, database: 'MySQL', sample: rows };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Close connections
    async close() {
        if (this.mysqlPool) {
            await this.mysqlPool.end();
        }
        // Supabase client doesn't need explicit closing
    }
}

module.exports = DatabaseAdapter;