var express = require('express');
var router = express.Router();

// Search participants endpoint
router.get('/search-participants', function(req, res, next) {
  const query = req.query.q;
  const username = req.headers['x-username'] || 'Guest';
  
  console.log('Search query:', query);
  console.log('Username:', username);
  
  // Mock data for demonstration - replace with actual database queries
  const mockParticipants = [
    {
      id: 1,
      full_name: 'Juan Dela Cruz',
      relation_to_head_code: 'Head',
      purok_gimong: 'Purok 1',
      barangay_name: 'Barangay Centro'
    },
    {
      id: 2,
      full_name: 'Maria Santos',
      relation_to_head_code: 'Spouse',
      purok_gimong: 'Purok 2',
      barangay_name: 'Barangay Norte'
    }
  ];
  
  // Filter mock data based on query
  const filtered = mockParticipants.filter(p => 
    p.full_name.toLowerCase().includes(query.toLowerCase())
  );
  
  res.json(filtered);
});

// Get participant details endpoint
router.get('/participant/:id', function(req, res, next) {
  const participantId = req.params.id;
  const username = req.headers['x-username'] || 'Guest';
  
  console.log('Getting details for participant:', participantId);
  console.log('Username:', username);
  
  // Mock detailed participant data - replace with actual database queries
  const mockDetails = {
    household: {
      purok_gimong: 'Purok 1',
      barangay_name: 'Barangay Centro',
      municipality: 'Tuguegarao City',
      parish_name: 'St. Peter Parish',
      num_family_members: '4',
      years_residency: '5-10 years'
    },
    family_members: [
      {
        full_name: 'Juan Dela Cruz',
        relation_to_head_code: 'Head',
        age: '35',
        educational_attainment_code: 'College Graduate',
        occupation_code: 'Government Employee'
      },
      {
        full_name: 'Maria Santos',
        relation_to_head_code: 'Spouse',
        age: '32',
        educational_attainment_code: 'College Graduate',
        occupation_code: 'Teacher'
      }
    ],
    health_conditions: {
      common_illness_codes: 'Hypertension',
      potable_water_source_code: 'Tap Water',
      toilet_facility_code: 'Water Sealed',
      garbage_disposal_code: 'Collected by LGU'
    },
    socio_economic: {
      income_monthly_code: '20,000-30,000',
      house_lot_ownership_code: 'Owned',
      house_classification_code: 'Concrete'
    },
    userRole: username.includes('Archdiocese') ? 'archdiocese' : 'parish',
    userParish: username.includes('Parish') ? 'St. Peter Parish' : null
  };
  
  res.json(mockDetails);
});

module.exports = router;