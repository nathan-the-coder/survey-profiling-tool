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
                // Fallback to MySQL for now
                this.useSupabase = false;
                this.initializeConnection();
                return;
            }
            
            this.supabaseClient = createClient(supabaseUrl, supabaseKey);
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
        }
    }

    // Get all participants with role-based filtering
    async getAllParticipants(userRole, userParish) {
        try {
            if (this.useSupabase) {
                // Supabase implementation
                let supabaseQuery = this.supabaseClient
                    .from('family_members')
                    .select(`
                        id,
                        full_name,
                        relation_to_head_code,
                        age,
                        purok_gimong,
                        barangay_name,
                        households!inner(
                            parish_name
                        )
                    `);

                // Apply role-based filtering
                if (userRole === 'parish' && userParish) {
                    supabaseQuery = supabaseQuery.eq('households.parish_name', userParish);
                }

                const { data, error } = await supabaseQuery.order('full_name');
                
                if (error) throw error;
                
                // Flatten the data structure
                return data.map(item => ({
                    id: item.id,
                    full_name: item.full_name,
                    relation_to_head_code: item.relation_to_head_code,
                    age: item.age,
                    purok_gimong: item.purok_gimong,
                    barangay_name: item.barangay_name,
                    parish_name: item.households?.parish_name
                }));
            } else {
                // MySQL implementation
                let sql = `
                    SELECT 
                        fm.id,
                        fm.full_name,
                        fm.relation_to_head_code,
                        fm.age,
                        fm.purok_gimong,
                        fm.barangay_name,
                        h.parish_name
                    FROM family_members fm
                    INNER JOIN households h ON fm.household_id = h.id
                `;
                
                const params = [];
                
                // Apply role-based filtering
                if (userRole === 'parish' && userParish) {
                    sql += ' WHERE h.parish_name = ?';
                    params.push(userParish);
                }
                
                sql += ' ORDER BY fm.full_name';
                
                const [rows] = await this.mysqlPool.execute(sql, params);
                return rows;
            }
        } catch (error) {
            throw error;
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
                
                // Flatten the data structure
                return data.map(item => ({
                    id: item.id,
                    full_name: item.full_name,
                    relation_to_head_code: item.relation_to_head_code,
                    purok_gimong: item.purok_gimong,
                    barangay_name: item.barangay_name,
                    parish_name: item.households?.parish_name
                }));
            } else {
                // MySQL implementation
                let sql = `
                    SELECT 
                        fm.id,
                        fm.full_name,
                        fm.relation_to_head_code,
                        fm.purok_gimong,
                        fm.barangay_name,
                        h.parish_name
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
            throw error;
        }
    }

    // Get participant details
    async getParticipantDetails(participantId, userRole, userParish) {
        try {
            console.log(`Fetching participant details for ID: ${participantId}, userRole: ${userRole}, userParish: ${userParish}`);
            
            // First get the household_id for this participant
            let householdId;
            
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('family_members')
                    .select('household_id')
                    .eq('id', participantId);
                
                if (error) {
                    console.error('Supabase error fetching household_id:', error);
                    throw error;
                }
                
                console.log(`Supabase query result for participant ${participantId}:`, data);
                
                if (!data || data.length === 0) {
                    console.error(`No family_member found with ID: ${participantId}`);
                    throw new Error(`Participant with ID ${participantId} not found in family_members table`);
                }
                
                householdId = data[0]?.household_id;
                console.log(`Found household_id: ${householdId}`);
            } else {
                const [rows] = await this.mysqlPool.execute(
                    'SELECT household_id FROM family_members WHERE id = ?', 
                    [participantId]
                );
                console.log(`MySQL query result for participant ${participantId}:`, rows);
                householdId = rows[0]?.household_id;
            }
            
            if (!householdId) {
                console.error(`No household_id found for participant ID: ${participantId}`);
                throw new Error(`Participant with ID ${participantId} not found`);
            }
            
            if (this.useSupabase) {
                // Supabase implementation
                // Get household info
                const { data: household, error: householdError } = await this.supabaseClient
                    .from('households')
                    .select('*')
                    .eq('id', householdId)
                    .single();

                // Get family members
                const { data: familyMembers, error: familyError } = await this.supabaseClient
                    .from('family_members')
                    .select('*')
                    .eq('household_id', householdId);

                // Get health conditions
                const { data: healthConditions, error: healthError } = await this.supabaseClient
                    .from('health_conditions')
                    .select('*')
                    .eq('household_id', householdId)
                    .single();

                // Get socio-economic data
                const { data: socioEconomic, error: socioError } = await this.supabaseClient
                    .from('socio_economic')
                    .select('*')
                    .eq('household_id', householdId)
                    .single();

                if (householdError || familyError) {
                    throw new Error('Error fetching participant details');
                }

                return {
                    household,
                    family_members: familyMembers,
                    health_conditions: healthConditions || {},
                    socio_economic: socioEconomic || {},
                    userRole,
                    userParish
                };
            } else {
                // MySQL implementation
                const [householdRows] = await this.mysqlPool.execute(
                    'SELECT * FROM households WHERE id = ?', [householdId]
                );
                const [familyRows] = await this.mysqlPool.execute(
                    'SELECT * FROM family_members WHERE household_id = ?', [householdId]
                );
                const [healthRows] = await this.mysqlPool.execute(
                    'SELECT * FROM health_conditions WHERE household_id = ?', [householdId]
                );
                const [socioRows] = await this.mysqlPool.execute(
                    'SELECT * FROM socio_economic WHERE household_id = ?', [householdId]
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
            throw error;
        }
    }

    // Update participant
    async updateParticipant(participantId, updateData) {
        try {
            const { household, family_members, health_conditions, socio_economic } = updateData;
            
            // Get household_id for this participant
            let householdId;
            
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('family_members')
                    .select('household_id')
                    .eq('id', participantId)
                    .single();
                
                if (error) throw error;
                householdId = data?.household_id;
            } else {
                const [rows] = await this.mysqlPool.execute(
                    'SELECT household_id FROM family_members WHERE id = ?', 
                    [participantId]
                );
                householdId = rows[0]?.household_id;
            }
            
            if (!householdId) {
                throw new Error('Participant not found');
            }
            
            if (this.useSupabase) {
                // Update household
                if (household) {
                    await this.supabaseClient
                        .from('households')
                        .update(household)
                        .eq('id', householdId);
                }
                
                // Update family members
                if (family_members && Array.isArray(family_members)) {
                    for (const member of family_members) {
                        if (member.id) {
                            await this.supabaseClient
                                .from('family_members')
                                .update(member)
                                .eq('id', member.id);
                        }
                    }
                }
                
                // Update health conditions
                if (health_conditions) {
                    await this.supabaseClient
                        .from('health_conditions')
                        .upsert({ ...health_conditions, household_id: householdId });
                }
                
                // Update socio-economic
                if (socio_economic) {
                    await this.supabaseClient
                        .from('socio_economic')
                        .upsert({ ...socio_economic, household_id: householdId });
                }
            } else {
                // MySQL implementation
                if (household) {
                    const fields = Object.keys(household);
                    const values = Object.values(household);
                    const setClause = fields.map(f => `${f} = ?`).join(', ');
                    await this.mysqlPool.execute(
                        `UPDATE households SET ${setClause} WHERE id = ?`,
                        [...values, householdId]
                    );
                }
                
                if (family_members && Array.isArray(family_members)) {
                    for (const member of family_members) {
                        if (member.id) {
                            const fields = Object.keys(member).filter(k => k !== 'id');
                            const values = fields.map(f => member[f]);
                            const setClause = fields.map(f => `${f} = ?`).join(', ');
                            await this.mysqlPool.execute(
                                `UPDATE family_members SET ${setClause} WHERE id = ?`,
                                [...values, member.id]
                            );
                        }
                    }
                }
            }
            
            return { success: true, householdId };
        } catch (error) {
            throw error;
        }
    }

    // Delete participant (and associated household data)
    async deleteParticipant(participantId) {
        try {
            // Get household_id for this participant
            let householdId;
            
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('family_members')
                    .select('household_id')
                    .eq('id', participantId)
                    .single();
                
                if (error) throw error;
                householdId = data?.household_id;
            } else {
                const [rows] = await this.mysqlPool.execute(
                    'SELECT household_id FROM family_members WHERE id = ?', 
                    [participantId]
                );
                householdId = rows[0]?.household_id;
            }
            
            if (!householdId) {
                throw new Error('Participant not found');
            }
            
            if (this.useSupabase) {
                // Delete in correct order to maintain referential integrity
                await this.supabaseClient.from('family_members').delete().eq('household_id', householdId);
                await this.supabaseClient.from('health_conditions').delete().eq('household_id', householdId);
                await this.supabaseClient.from('socio_economic').delete().eq('household_id', householdId);
                await this.supabaseClient.from('households').delete().eq('id', householdId);
            } else {
                await this.mysqlPool.execute('DELETE FROM family_members WHERE household_id = ?', [householdId]);
                await this.mysqlPool.execute('DELETE FROM health_conditions WHERE household_id = ?', [householdId]);
                await this.mysqlPool.execute('DELETE FROM socio_economic WHERE household_id = ?', [householdId]);
                await this.mysqlPool.execute('DELETE FROM households WHERE id = ?', [householdId]);
            }
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    // User Management Methods
    
    // Get all users
    async getAllUsers() {
        try {
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('users')
                    .select('*')
                    .order('username');
                
                if (error) throw error;
                return data;
            } else {
                const [rows] = await this.mysqlPool.execute('SELECT * FROM users ORDER BY username');
                return rows;
            }
        } catch (error) {
            throw error;
        }
    }

    // Create new user
    async createUser(userData) {
        try {
            const { username, password, role, parish } = userData;
            
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('users')
                    .insert([{ username, password, role, parish }])
                    .select();
                
                if (error) throw error;
                return data[0];
            } else {
                const [result] = await this.mysqlPool.execute(
                    'INSERT INTO users (username, password, role, parish) VALUES (?, ?, ?, ?)',
                    [username, password, role, parish]
                );
                return { id: result.insertId, username, role, parish };
            }
        } catch (error) {
            throw error;
        }
    }

    // Update user
    async updateUser(userId, userData) {
        try {
            const { username, password, role, parish } = userData;
            
            if (this.useSupabase) {
                const updateObj = { username, role, parish };
                if (password) updateObj.password = password;
                
                const { data, error } = await this.supabaseClient
                    .from('users')
                    .update(updateObj)
                    .eq('id', userId)
                    .select();
                
                if (error) throw error;
                return data[0];
            } else {
                let sql = 'UPDATE users SET username = ?, role = ?, parish = ?';
                let params = [username, role, parish];
                
                if (password) {
                    sql += ', password = ?';
                    params.push(password);
                }
                
                sql += ' WHERE id = ?';
                params.push(userId);
                
                await this.mysqlPool.execute(sql, params);
                return { id: userId, username, role, parish };
            }
        } catch (error) {
            throw error;
        }
    }

    // Delete user
    async deleteUser(userId) {
        try {
            if (this.useSupabase) {
                const { error } = await this.supabaseClient
                    .from('users')
                    .delete()
                    .eq('id', userId);
                
                if (error) throw error;
            } else {
                await this.mysqlPool.execute('DELETE FROM users WHERE id = ?', [userId]);
            }
            
            return { success: true };
        } catch (error) {
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

    // Get all parishes from users table
    async getAllParishes() {
        try {
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('users')
                    .select('username')
                    .order('username');
                
                if (error) throw error;
                return data.map(item => item.username);
            } else {
                const [rows] = await this.mysqlPool.execute('SELECT username FROM users ORDER BY username');
                return rows.map(item => item.username);
            }
        } catch (error) {
            throw error;
        }
    }

    // Authenticate user
    async authenticateUser(username, password) {
        try {
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('users')
                    .select('*')
                    .eq('username', username)
                    .eq('password', password)
                    .single();
                
                if (error) return null;
                return data;
            } else {
                const [rows] = await this.mysqlPool.execute(
                    'SELECT * FROM users WHERE username = ? AND password = ?',
                    [username, password]
                );
                return rows[0] || null;
            }
        } catch (error) {
            throw error;
        }
    }

    // Close connections
    async close() {
        if (this.mysqlPool) {
            await this.mysqlPool.end();
        }
    }
}

module.exports = DatabaseAdapter;
