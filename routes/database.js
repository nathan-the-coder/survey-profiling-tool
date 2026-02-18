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
                        member_id,
                        full_name,
                        role,
                        relation_to_head_code,
                        age,
                        occupation,
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
                    id: item.member_id,
                    full_name: item.full_name,
                    role: item.role,
                    relation_to_head_code: item.relation_to_head_code,
                    age: item.age,
                    occupation: item.occupation,
                    purok_gimong: item.purok_gimong,
                    barangay_name: item.barangay_name,
                    parish_name: item.households?.parish_name
                }));
            } else {
                // MySQL implementation
                let sql = `
                    SELECT 
                        fm.member_id as id,
                        fm.full_name,
                        fm.role,
                        fm.relation_to_head_code,
                        fm.age,
                        fm.occupation,
                        fm.purok_gimong,
                        fm.barangay_name,
                        h.parish_name
                    FROM family_members fm
                    INNER JOIN households h ON fm.household_id = h.household_id
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
                        member_id,
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
                    id: item.member_id,
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
                        fm.member_id as id,
                        fm.full_name,
                        fm.relation_to_head_code,
                        fm.purok_gimong,
                        fm.barangay_name,
                        h.parish_name
                    FROM family_members fm
                    INNER JOIN households h ON fm.household_id = h.household_id
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
            
            // First get the household_id from family_members table using member_id
            let householdId;
            
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('family_members')
                    .select('household_id')
                    .eq('member_id', participantId);
                
                if (error) {
                    console.error('Supabase error fetching household_id:', error);
                    throw error;
                }
                
                if (!data || data.length === 0) {
                    throw new Error(`Family member with ID ${participantId} not found`);
                }
                
                householdId = data[0]?.household_id;
                console.log(`Found household_id ${householdId} for member_id ${participantId}`);
            } else {
                const [rows] = await this.mysqlPool.execute(
                    'SELECT household_id FROM family_members WHERE member_id = ?', 
                    [participantId]
                );
                
                if (!rows || rows.length === 0) {
                    throw new Error(`Family member with ID ${participantId} not found`);
                }
                
                householdId = rows[0]?.household_id;
                console.log(`Found household_id ${householdId} for member_id ${participantId}`);
            }
            
            if (!householdId) {
                throw new Error(`No household found for family member ID ${participantId}`);
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
            
            // The participantId is the household_id
            const householdId = parseInt(participantId);
            
            if (isNaN(householdId)) {
                throw new Error(`Invalid household ID: ${participantId}`);
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
            // The participantId is the household_id
            const householdId = parseInt(participantId);
            
            if (isNaN(householdId)) {
                throw new Error(`Invalid household ID: ${participantId}`);
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
                    .select('id, username, role, parish_id')
                    .order('username');
                
                if (error) throw error;
                return data;
            } else {
                const [rows] = await this.mysqlPool.execute('SELECT id, username, role, parish_id FROM users ORDER BY username');
                return rows;
            }
        } catch (error) {
            throw error;
        }
    }

    // Create new user
    async createUser(userData) {
        try {
            const { username, password, role, parish_id } = userData;
            
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('users')
                    .insert([{ username, password, role, parish_id }])
                    .select();
                
                if (error) throw error;
                return data[0];
            } else {
                const [result] = await this.mysqlPool.execute(
                    'INSERT INTO users (username, password, role, parish_id) VALUES (?, ?, ?, ?)',
                    [username, password, role, parish_id]
                );
                return { id: result.insertId, username, role, parish_id };
            }
        } catch (error) {
            throw error;
        }
    }

    // Update user
    async updateUser(userId, userData) {
        try {
            const { username, password, role, parish_id } = userData;
            
            if (this.useSupabase) {
                const updateObj = { username, role, parish_id };
                if (password) updateObj.password = password;
                
                const { data, error } = await this.supabaseClient
                    .from('users')
                    .update(updateObj)
                    .eq('id', userId)
                    .select();
                
                if (error) throw error;
                return data[0];
            } else {
                let sql = 'UPDATE users SET username = ?, role = ?, parish_id = ?';
                let params = [username, role, parish_id];
                
                if (password) {
                    sql += ', password = ?';
                    params.push(password);
                }
                
                sql += ' WHERE id = ?';
                params.push(userId);
                
                await this.mysqlPool.execute(sql, params);
                return { id: userId, username, role, parish_id };
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

    // Get all parishes
    async getAllParishes() {
        try {
            if (this.useSupabase) {
                const { data, error } = await this.supabaseClient
                    .from('parishes')
                    .select('*')
                    .order('name');
                
                if (error) throw error;
                return data;
            } else {
                const [rows] = await this.mysqlPool.execute('SELECT * FROM parishes ORDER BY name');
                return rows;
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
                    .select('*, parishes:parish_id(name)')
                    .eq('username', username)
                    .eq('password', password)
                    .single();
                
                if (error) return null;
                return data;
            } else {
                const [rows] = await this.mysqlPool.execute(
                    'SELECT u.*, p.name as parish_name FROM users u LEFT JOIN parishes p ON u.parish_id = p.id WHERE u.username = ? AND u.password = ?',
                    [username, password]
                );
                return rows[0] || null;
            }
        } catch (error) {
            throw error;
        }
    }

    // Create a complete survey participant (household + family members + health + socio)
    async createSurveyParticipant(data) {
        const { general, primary, health, socio } = data;

        const toNumber = (val) => {
            if (val === '' || val === null || val === undefined) return null;
            const num = Number(val);
            return isNaN(num) ? null : num;
        };

        const getValue = (obj, key) => (obj && obj[key] !== undefined && obj[key] !== '' ? obj[key] : null);
        const getArrayValue = (obj, key) => {
            if (!obj || !obj[key]) return null;
            const val = obj[key];
            if (Array.isArray(val)) {
                return val.length > 0 ? val : null;
            }
            return val ? [val] : null;
        };

        const toBoolean = (val) => {
            if (val === '1' || val === 1 || val === true) return true;
            if (val === '2' || val === 2 || val === false || val === '66' || val === null || val === '') return false;
            return null;
        };

        try {
            if (this.useSupabase) {
                // Create household
                const householdData = {
                    purok_gimong: getValue(general, 'purokGimong'),
                    barangay_name: getValue(general, 'barangayName'),
                    municipality: getValue(general, 'municipality-select') || getValue(general, 'municipalityName'),
                    province: getValue(general, 'provinceName'),
                    mode_of_transportation: getArrayValue(general, 'modeOfTransportation'),
                    road_structure: getValue(general, 'road_Structure'),
                    urban_rural_classification: getValue(general, 'urban_ruralClassification'),
                    parish_name: getValue(general, 'nameOfParish'),
                    diocese_prelature: getValue(general, 'diocesePrelatureName'),
                    years_residency: toNumber(getValue(general, 'yrOfResInTheCommunity')),
                    num_family_members: toNumber(getValue(general, 'numOfFamMembers')),
                    family_structure: getValue(general, 'familyStructure'),
                    local_dialect: getValue(general, 'lclDialect'),
                    ethnicity: getValue(general, 'ethnicity'),
                    missionary_companion: getValue(socio, 'missionary_companion'),
                    date_of_listing: getValue(socio, 'listening_date')
                };

                const { data: household, error: hhError } = await this.supabaseClient
                    .from('households')
                    .insert([householdData])
                    .select()
                    .single();

                if (hhError) throw hhError;
                const householdId = household.household_id;

                // Create family members
                const insertMember = async (role, memberData) => {
                    if (memberData.full_name) {
                        await this.supabaseClient
                            .from('family_members')
                            .insert([{ household_id: householdId, role, ...memberData }]);
                    }
                };

                await insertMember('HH Head', {
                    full_name: getValue(primary, 'head_name'),
                    type_of_marriage: getValue(primary, 'head_marriage'),
                    civil_status_code: getValue(primary, 'civil_status_code') || '',
                    religion_code: getValue(primary, 'head_religion'),
                    sex_code: getValue(primary, 'head_sex'),
                    age: toNumber(getValue(primary, 'head_age')),
                    highest_educ_attainment: getValue(primary, 'head_educ'),
                    occupation: getValue(primary, 'head_job'),
                    status_of_work_code: getValue(primary, 'head_work_status'),
                    organization_code: getValue(primary, 'head_organization'),
                    position: getValue(primary, 'head_position') || '',
                    email: getValue(primary, 'head_email') || '',
                    phone_number: getValue(primary, 'head_phone_number') || ''
                });

                await insertMember('Spouse', {
                    full_name: getValue(primary, 'spouse_name') || '',
                    civil_status_code: getValue(primary, 'civil_status_code') || '',
                    type_of_marriage: getValue(primary, 'spouse_marriage') || '',
                    religion_code: getValue(primary, 'spouse_religion') || '',
                    sex_code: getValue(primary, 'spouse_sex') || '',
                    age: toNumber(getValue(primary, 'spouse_age')) || '',
                    highest_educ_attainment: getValue(primary, 'spouse_educ') || '',
                    occupation: getValue(primary, 'spouse_job') || '',
                    status_of_work_code: getValue(primary, 'spouse_work_status') || '',
                    organization_code: getValue(primary, 'spouse_organization'),
                    position: getValue(primary, 'spouse_position') || '',
                    email: getValue(primary, 'spouse_email') || '',
                    phone_number: getValue(primary, 'spouse_phone_number') || ''
                });

                if (primary?.m_name && Array.isArray(primary.m_name)) {
                    const memberInserts = primary.m_name.map((name, i) => {
                        if (!name) return null;
                        return {
                            household_id: householdId,
                            role: primary.m_role?.[i] || 'Member',
                            full_name: name,
                            relation_to_head_code: primary.m_relation?.[i],
                            sex_code: primary.m_sex?.[i],
                            age: toNumber(primary.m_age?.[i]),
                            civil_status_code: primary.m_civil?.[i],
                            religion_code: primary.m_religion?.[i],
                            sacraments_code: getArrayValue({ m_sacraments: primary.m_sacraments }, 'm_sacraments'),
                            is_studying: toBoolean(primary.m_studying?.[i]),
                            highest_educ_attainment: primary.m_educ?.[i],
                            occupation: primary.m_job?.[i],
                            status_of_work_code: primary.m_work_status?.[i],
                            fully_immunized_child: toBoolean(primary.m_immunized?.[i]),
                            organization_code: getArrayValue({ m_organization: primary.m_organization }, 'm_organization'),
                            position: primary.m_position?.[i] || null,
                            email: primary.m_email?.[i] || '',
                            phone_number: primary.m_phone_number?.[i] || ''
                        };
                    }).filter(Boolean);

                    if (memberInserts.length > 0) {
                        await this.supabaseClient.from('family_members').insert(memberInserts);
                    }
                }

                // Create health conditions
                const healthData = {
                    household_id: householdId,
                    common_illness_codes: getArrayValue(health, 'common_illness'),
                    treatment_source_code: getArrayValue(health, 'treatment_source'),
                    potable_water_source_code: getArrayValue(health, 'water_source'),
                    lighting_source_code: getArrayValue(health, 'lighting_source'),
                    cooking_source_code: getArrayValue(health, 'cooking_source'),
                    garbage_disposal_code: getArrayValue(health, 'garbage_disposal'),
                    toilet_facility_code: getArrayValue(health, 'toilet_type'),
                    water_to_toilet_distance_code: getValue(health, 'toilet_distance')
                };
                await this.supabaseClient.from('health_conditions').insert([healthData]);

                // Create socio-economic
                const socioData = {
                    household_id: householdId,
                    income_monthly_code: getValue(socio, 'income_monthly'),
                    expenses_weekly_code: getValue(socio, 'expenses_weekly'),
                    has_savings: toBoolean(getValue(socio, 'has_savings')),
                    savings_location_code: getArrayValue(socio, 'savings_location'),
                    house_lot_ownership_code: getArrayValue(socio, 'house_ownership'),
                    house_classification_code: getArrayValue(socio, 'house_classification'),
                    land_area_hectares: toNumber(getValue(socio, 'land_area')),
                    dist_from_church_code: getValue(socio, 'distance_church'),
                    dist_from_market_code: getValue(socio, 'distance_market')
                };
                await this.supabaseClient.from('socio_economic').insert([socioData]);

                return { success: true, id: householdId };
            } else {
                // MySQL implementation
                const householdData = {
                    purok_gimong: getValue(general, 'purokGimong'),
                    barangay_name: getValue(general, 'barangayName'),
                    municipality: getValue(general, 'municipality-select') || getValue(general, 'municipalityName'),
                    province: getValue(general, 'provinceName'),
                    mode_of_transportation: getArrayValue(general, 'modeOfTransportation')?.join(','),
                    road_structure: getValue(general, 'road_Structure'),
                    urban_rural_classification: getValue(general, 'urban_ruralClassification'),
                    parish_name: getValue(general, 'nameOfParish'),
                    diocese_prelature: getValue(general, 'diocesePrelatureName'),
                    years_residency: toNumber(getValue(general, 'yrOfResInTheCommunity')),
                    num_family_members: toNumber(getValue(general, 'numOfFamMembers')),
                    family_structure: getValue(general, 'familyStructure'),
                    local_dialect: getValue(general, 'lclDialect'),
                    ethnicity: getValue(general, 'ethnicity'),
                    missionary_companion: getValue(socio, 'missionary_companion'),
                    date_of_listing: getValue(socio, 'listening_date')
                };

                const hhFields = Object.keys(householdData).filter(k => householdData[k] !== null);
                const hhValues = hhFields.map(k => householdData[k]);
                const hhPlaceholders = hhFields.map(() => '?').join(', ');

                const [hhResult] = await this.mysqlPool.execute(
                    `INSERT INTO households (${hhFields.join(', ')}) VALUES (${hhPlaceholders})`,
                    hhValues
                );
                const householdId = hhResult.insertId;

                // Create family members
                const insertMember = async (role, memberData) => {
                    if (memberData.full_name) {
                        const fields = Object.keys(memberData).filter(k => memberData[k] !== null && memberData[k] !== '');
                        const values = fields.map(k => memberData[k]);
                        const placeholders = fields.map(() => '?').join(', ');
                        await this.mysqlPool.execute(
                            `INSERT INTO family_members (household_id, role, ${fields.join(', ')}) VALUES (?, ${placeholders})`,
                            [householdId, role, ...values]
                        );
                    }
                };

                await insertMember('HH Head', {
                    full_name: getValue(primary, 'head_name'),
                    type_of_marriage: getValue(primary, 'head_marriage'),
                    civil_status_code: getValue(primary, 'civil_status_code') || '',
                    religion_code: getValue(primary, 'head_religion'),
                    sex_code: getValue(primary, 'head_sex'),
                    age: toNumber(getValue(primary, 'head_age')),
                    highest_educ_attainment: getValue(primary, 'head_educ'),
                    occupation: getValue(primary, 'head_job'),
                    status_of_work_code: getValue(primary, 'head_work_status'),
                    organization_code: getValue(primary, 'head_organization'),
                    position: getValue(primary, 'head_position') || '',
                    email: getValue(primary, 'head_email') || '',
                    phone_number: getValue(primary, 'head_phone_number') || ''
                });

                await insertMember('Spouse', {
                    full_name: getValue(primary, 'spouse_name') || '',
                    civil_status_code: getValue(primary, 'civil_status_code') || '',
                    type_of_marriage: getValue(primary, 'spouse_marriage') || '',
                    religion_code: getValue(primary, 'spouse_religion') || '',
                    sex_code: getValue(primary, 'spouse_sex') || '',
                    age: toNumber(getValue(primary, 'spouse_age')) || '',
                    highest_educ_attainment: getValue(primary, 'spouse_educ') || '',
                    occupation: getValue(primary, 'spouse_job') || '',
                    status_of_work_code: getValue(primary, 'spouse_work_status') || '',
                    organization_code: getValue(primary, 'spouse_organization'),
                    position: getValue(primary, 'spouse_position') || '',
                    email: getValue(primary, 'spouse_email') || '',
                    phone_number: getValue(primary, 'spouse_phone_number') || ''
                });

                if (primary?.m_name && Array.isArray(primary.m_name)) {
                    for (let i = 0; i < primary.m_name.length; i++) {
                        if (!primary.m_name[i]) continue;
                        const memberData = {
                            role: primary.m_role?.[i] || 'Member',
                            full_name: primary.m_name[i],
                            relation_to_head_code: primary.m_relation?.[i],
                            sex_code: primary.m_sex?.[i],
                            age: toNumber(primary.m_age?.[i]),
                            civil_status_code: primary.m_civil?.[i],
                            religion_code: primary.m_religion?.[i],
                            sacraments_code: getArrayValue({ m_sacraments: primary.m_sacraments }, 'm_sacraments')?.join(','),
                            is_studying: toBoolean(primary.m_studying?.[i]),
                            highest_educ_attainment: primary.m_educ?.[i],
                            occupation: primary.m_job?.[i],
                            status_of_work_code: primary.m_work_status?.[i],
                            fully_immunized_child: toBoolean(primary.m_immunized?.[i]),
                            organization_code: getArrayValue({ m_organization: primary.m_organization }, 'm_organization')?.join(','),
                            position: primary.m_position?.[i] || null,
                            email: primary.m_email?.[i] || '',
                            phone_number: primary.m_phone_number?.[i] || ''
                        };
                        await insertMember('Member', memberData);
                    }
                }

                // Create health conditions
                const healthData = {
                    household_id: householdId,
                    common_illness_codes: getArrayValue(health, 'common_illness')?.join(','),
                    treatment_source_code: getArrayValue(health, 'treatment_source')?.join(','),
                    potable_water_source_code: getArrayValue(health, 'water_source')?.join(','),
                    lighting_source_code: getArrayValue(health, 'lighting_source')?.join(','),
                    cooking_source_code: getArrayValue(health, 'cooking_source')?.join(','),
                    garbage_disposal_code: getArrayValue(health, 'garbage_disposal')?.join(','),
                    toilet_facility_code: getArrayValue(health, 'toilet_type')?.join(','),
                    water_to_toilet_distance_code: getValue(health, 'toilet_distance')
                };
                const healthFields = Object.keys(healthData).filter(k => healthData[k] !== null);
                const healthValues = healthFields.map(k => healthData[k]);
                const healthPlaceholders = healthFields.map(() => '?').join(', ');
                await this.mysqlPool.execute(
                    `INSERT INTO health_conditions (${healthFields.join(', ')}) VALUES (${healthPlaceholders})`,
                    healthValues
                );

                // Create socio-economic
                const socioData = {
                    household_id: householdId,
                    income_monthly_code: getValue(socio, 'income_monthly'),
                    expenses_weekly_code: getValue(socio, 'expenses_weekly'),
                    has_savings: toBoolean(getValue(socio, 'has_savings')),
                    savings_location_code: getArrayValue(socio, 'savings_location')?.join(','),
                    house_lot_ownership_code: getArrayValue(socio, 'house_ownership')?.join(','),
                    house_classification_code: getArrayValue(socio, 'house_classification')?.join(','),
                    land_area_hectares: toNumber(getValue(socio, 'land_area')),
                    dist_from_church_code: getValue(socio, 'distance_church'),
                    dist_from_market_code: getValue(socio, 'distance_market')
                };
                const socioFields = Object.keys(socioData).filter(k => socioData[k] !== null);
                const socioValues = socioFields.map(k => socioData[k]);
                const socioPlaceholders = socioFields.map(() => '?').join(', ');
                await this.mysqlPool.execute(
                    `INSERT INTO socio_economic (${socioFields.join(', ')}) VALUES (${socioPlaceholders})`,
                    socioValues
                );

                return { success: true, id: householdId };
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
