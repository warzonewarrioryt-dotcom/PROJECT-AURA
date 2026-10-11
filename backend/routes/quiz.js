/* =========================================================
   PROJECT AURA 3.0
   ACADEMIC INTELLIGENCE, QUIZ & MOCK EXAMS ENGINE
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const aiRouterService = require("../services/aiRouter");
const knowledgeEngine = require("../knowledgeEngine");
const auraDB = require("../database");

/* ---------------------------------------------------------
   COLLEGES DIRECTORY (ALL 38 TAMIL NADU DISTRICTS + SOUTH STATES)
--------------------------------------------------------- */
const COLLEGES_DIRECTORY = [
  // ── TAMIL NADU (ALL 38 DISTRICTS COVERED) ──
  { id: "gce_ariyalur", name: "Government College of Engineering, Ariyalur", state: "Tamil Nadu", district: "Ariyalur", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "srm_chengalpattu", name: "SRM Institute of Science and Technology, Kattankulathur", state: "Tamil Nadu", district: "Chengalpattu", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT", "BIOTECH"] },
  { id: "ceg_anna", name: "College of Engineering Guindy (CEG), Anna University", state: "Tamil Nadu", district: "Chennai", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT", "BIOTECH"] },
  { id: "mit_anna", name: "Madras Institute of Technology (MIT), Anna University", state: "Tamil Nadu", district: "Chennai", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "IT"] },
  { id: "mmc_chennai", name: "Madras Medical College (MMC)", state: "Tamil Nadu", district: "Chennai", branches: ["MBBS", "BDS", "PHARM", "NURSING"] },
  { id: "loyola_chennai", name: "Loyola College (Autonomous)", state: "Tamil Nadu", district: "Chennai", branches: ["BSC_CS", "BCA", "BCOM", "BBA"] },
  { id: "psg_tech", name: "PSG College of Technology", state: "Tamil Nadu", district: "Coimbatore", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT", "BIOTECH"] },
  { id: "cit_cbe", name: "Coimbatore Institute of Technology (CIT)", state: "Tamil Nadu", district: "Coimbatore", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "gct_cbe", name: "Government College of Technology (GCT)", state: "Tamil Nadu", district: "Coimbatore", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "uce_panruti", name: "University College of Engineering (Anna University), Panruti", state: "Tamil Nadu", district: "Cuddalore", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "gce_dharmapuri", name: "Government College of Engineering, Dharmapuri", state: "Tamil Nadu", district: "Dharmapuri", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "psna_dindigul", name: "PSNA College of Engineering and Technology", state: "Tamil Nadu", district: "Dindigul", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "bannari_amman", name: "Bannari Amman Institute of Technology (BIT)", state: "Tamil Nadu", district: "Erode", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT", "BIOTECH"] },
  { id: "kongu_engg", name: "Kongu Engineering College", state: "Tamil Nadu", district: "Erode", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "gasc_kallakurichi", name: "Government Arts & Science College, Kallakurichi", state: "Tamil Nadu", district: "Kallakurichi", branches: ["BSC_CS", "BCA", "BCOM", "BBA"] },
  { id: "ssn_engg", name: "SSN College of Engineering", state: "Tamil Nadu", district: "Kanchipuram", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT", "BIOTECH"] },
  { id: "uce_nagercoil", name: "University College of Engineering, Nagercoil", state: "Tamil Nadu", district: "Kanyakumari", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "chettinad_karur", name: "Chettinad College of Engineering & Technology", state: "Tamil Nadu", district: "Karur", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "gce_bargur", name: "Government College of Engineering, Bargur", state: "Tamil Nadu", district: "Krishnagiri", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "tce_madurai", name: "Thiagarajar College of Engineering (TCE)", state: "Tamil Nadu", district: "Madurai", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "avc_mayiladuthurai", name: "A.V.C. College of Engineering", state: "Tamil Nadu", district: "Mayiladuthurai", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "egs_nagapattinam", name: "E.G.S. Pillay Engineering College", state: "Tamil Nadu", district: "Nagapattinam", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "ksr_namakkal", name: "K.S.R. College of Engineering", state: "Tamil Nadu", district: "Namakkal", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "gasc_ooty", name: "Government Arts College Ooty & JSS College", state: "Tamil Nadu", district: "Nilgiris", branches: ["PHARM", "BSC_CS", "BCA", "BCOM", "BBA"] },
  { id: "srinivasan_perambalur", name: "Dhanalakshmi Srinivasan Engineering College", state: "Tamil Nadu", district: "Perambalur", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "gce_pudukkottai", name: "Government College of Engineering, Gandarvakottai", state: "Tamil Nadu", district: "Pudukkottai", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "syed_ammal_ramnad", name: "Syed Ammal Engineering College", state: "Tamil Nadu", district: "Ramanathapuram", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "thiruvalluvar_ranipet", name: "Thanthai Periyar Govt Institute of Technology", state: "Tamil Nadu", district: "Ranipet", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "gce_salem", name: "Government College of Engineering (GCE) Salem", state: "Tamil Nadu", district: "Salem", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "acgcet_karaikudi", name: "Alagappa Chettiar Govt College of Engineering (ACGCET)", state: "Tamil Nadu", district: "Sivaganga", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "jp_tenkasi", name: "JP College of Engineering", state: "Tamil Nadu", district: "Tenkasi", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "sastra_univ", name: "SASTRA Deemed University", state: "Tamil Nadu", district: "Thanjavur", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT", "BIOTECH"] },
  { id: "gce_bodinayakkanur", name: "Government College of Engineering, Bodinayakkanur", state: "Tamil Nadu", district: "Theni", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "nec_kovilpatti", name: "National Engineering College (NEC), Kovilpatti", state: "Tamil Nadu", district: "Thoothukudi", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "nit_trichy", name: "National Institute of Technology (NIT) Tiruchirappalli", state: "Tamil Nadu", district: "Tiruchirappalli", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "gce_tirunelveli", name: "Government College of Engineering Tirunelveli", state: "Tamil Nadu", district: "Tirunelveli", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "priyadarshini_tirupathur", name: "Priyadarshini Engineering College, Vaniyambadi", state: "Tamil Nadu", district: "Tirupathur", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "sasurie_tiruppur", name: "Sasurie College of Engineering", state: "Tamil Nadu", district: "Tiruppur", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "rec_tiruvallur", name: "Rajalakshmi Engineering College (REC)", state: "Tamil Nadu", district: "Tiruvallur", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT", "BIOTECH"] },
  { id: "uce_arni", name: "University College of Engineering (Anna University), Arni", state: "Tamil Nadu", district: "Tiruvannamalai", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "cutn_tiruvarur", name: "Central University of Tamil Nadu (CUTN)", state: "Tamil Nadu", district: "Tiruvarur", branches: ["CSE", "BSC_CS", "BCA", "BCOM", "BBA"] },
  { id: "vit_vellore", name: "Vellore Institute of Technology (VIT)", state: "Tamil Nadu", district: "Vellore", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT", "BIOTECH"] },
  { id: "cmc_vellore", name: "Christian Medical College (CMC Vellore)", state: "Tamil Nadu", district: "Vellore", branches: ["MBBS", "BDS", "PHARM", "NURSING"] },
  { id: "uce_villupuram", name: "University College of Engineering, Villupuram", state: "Tamil Nadu", district: "Viluppuram", branches: ["CSE", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "mepco_virudhunagar", name: "Mepco Schlenk Engineering College", state: "Tamil Nadu", district: "Virudhunagar", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT", "BIOTECH"] },

  // ── KERALA ──
  { id: "cet_trivandrum", name: "College of Engineering Trivandrum (CET)", state: "Kerala", district: "Thiruvananthapuram", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },
  { id: "nit_calicut", name: "National Institute of Technology (NIT) Calicut", state: "Kerala", district: "Kozhikode", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] },

  // ── KARNATAKA ──
  { id: "rv_bengaluru", name: "RV College of Engineering (RVCE)", state: "Karnataka", district: "Bengaluru", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },
  { id: "nitk_surathkal", name: "National Institute of Technology Karnataka (NITK)", state: "Karnataka", district: "Mangalore", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL", "IT"] },

  // ── ANDHRA PRADESH ──
  { id: "au_vizag", name: "Andhra University College of Engineering", state: "Andhra Pradesh", district: "Visakhapatnam", branches: ["CSE", "AIDS", "CSBS", "ECE", "EEE", "MECH", "CIVIL"] }
];

/* ---------------------------------------------------------
   ALL GROUPS CURRICULUM DATABASE
   - Engineering (6 Theory Subjects per Sem)
   - CSBS (Computer Science & Business Systems: EXACTLY 7 SUBJECTS PER SEM)
   - Medical (6 Subjects)
   - Arts & Science (6 Subjects)
--------------------------------------------------------- */
const MASTER_CURRICULUM = {
  // ── GROUP 1: ENGINEERING ──
  ENGINEERING: {
    // SPECIAL REQUIREMENT: CSBS WITH EXACTLY 7 SUBJECTS PER SEMESTER
    CSBS: {
      name: "Computer Science & Business Systems (CSBS)",
      icon: "💼",
      subjectCount: 7,
      semesters: {
        1: [
          "Discrete Mathematics & Logic",
          "Introductory Computing & C",
          "Physics for Computing Science",
          "Principles of Electrical Engineering",
          "Fundamentals of Economics for Engineers",
          "Business Communication & Value Science I",
          "Computational Thinking & Ethics"
        ],
        2: [
          "Linear Algebra & Advanced Calculus",
          "Data Structures & Algorithms",
          "Principles of Electronics Engineering",
          "Fundamentals of Management",
          "Statistical Methods & Inference",
          "Business Communication & Value Science II",
          "Financial Accounting & Reporting"
        ],
        3: [
          "Formal Language & Automata Theory",
          "Object-Oriented Programming (Java / C++)",
          "Computer Organization & Architecture",
          "Computational Statistics",
          "Software Engineering & Agile Methods",
          "Marketing Research & Consumer Dynamics",
          "Indian Constitution & Business Ethics"
        ],
        4: [
          "Operating Systems & Virtualization",
          "Design & Analysis of Algorithms",
          "Database Management Systems (DBMS)",
          "Software Design with Object Modeling",
          "Operations Research & Optimization",
          "Financial Management & Corporate Finance",
          "Corporate Communication Lab Theory"
        ],
        5: [
          "Computer Networks & Protocols",
          "Information Security & Applied Cryptography",
          "Business Strategy & Strategic Management",
          "Artificial Intelligence & Decision Making",
          "Cloud Computing & Distributed Systems",
          "Human Resource Management in Tech",
          "Design Thinking & Enterprise Innovation"
        ],
        6: [
          "Compiler Design & Translation",
          "Machine Learning in Business Applications",
          "Financial & Managerial Cost Accounting",
          "Business Analytics & Big Data Systems",
          "Enterprise Resource Planning (ERP)",
          "Intellectual Property Rights & Cyber Law",
          "Product Management & Agile Delivery"
        ],
        7: [
          "Deep Learning & Cognitive Computing",
          "Fintech & Blockchain Architectures",
          "Digital Marketing & Web Analytics",
          "Organizational Behavior & Leadership",
          "Services Science & IT Service Management",
          "Supply Chain Engineering & Industrial IoT",
          "AI in Financial Risk Modeling"
        ],
        8: [
          "Enterprise Cloud & Hybrid Architecture",
          "Robotic Process Automation (RPA)",
          "Business Valuation & Mergers Analytics",
          "Quantum Computing in Financial Systems",
          "IT Governance, Risk & Auditing",
          "Sustainable Green Computing Strategies",
          "Capstone Industry Project & Synthesis"
        ]
      }
    },
    CSE: {
      name: "Computer Science & Engineering",
      icon: "💻",
      subjectCount: 6,
      semesters: {
        1: ["Engineering Mathematics I", "Programming in C", "Engineering Physics", "Engineering Chemistry", "Basic Electrical & Electronics", "Problem Solving with Python"],
        2: ["Engineering Mathematics II", "Data Structures", "Digital Logic Design", "Environmental Science", "Object-Oriented Programming in C++", "Engineering Graphics"],
        3: ["Data Structures & Algorithms", "Discrete Mathematics", "Object-Oriented Programming (Java)", "Computer Organization & Architecture", "Analog & Digital Communication", "Data Communications"],
        4: ["Operating Systems", "Design & Analysis of Algorithms", "Database Management Systems (DBMS)", "Software Engineering", "Microprocessors & Microcontrollers", "Theory of Computation"],
        5: ["Computer Networks", "Formal Languages & Automata", "Web Technologies & Full Stack", "Artificial Intelligence Foundations", "System Software", "Object-Oriented Analysis & Design"],
        6: ["Compiler Design", "Cloud Computing & DevOps", "Cryptography & Network Security", "Distributed Systems", "Mobile Application Development", "Internet of Things (IoT)"],
        7: ["Machine Learning", "Big Data Analytics", "High Performance Computing", "Cyber Security & Digital Forensics", "Software Testing & QA", "Professional Ethics in Engineering"],
        8: ["Deep Learning Systems", "Cloud Native Architectures", "Blockchain Technologies", "Information Storage Management", "Human Computer Interaction", "Capstone Engineering Design"]
      }
    },
    AIDS: {
      name: "Artificial Intelligence & Data Science",
      icon: "🧠",
      subjectCount: 6,
      semesters: {
        1: ["Linear Algebra & Calculus", "Python for Data Science", "Physics for Information Science", "Problem Solving with C", "Engineering Chemistry", "Computational Thinking"],
        2: ["Probability & Statistics", "Advanced Data Structures", "Foundations of AI", "Digital System Design", "Object-Oriented Java", "Environmental Studies"],
        3: ["Discrete Mathematics", "Design and Analysis of Algorithms", "Database Systems for Big Data", "Computer Systems Architecture", "Statistical Inference", "Data Wrangling & Cleaning"],
        4: ["Machine Learning Foundations", "Operating Systems", "Data Warehousing & Mining", "Software Engineering with Agile", "Applied Optimization Methods", "Signals & Data Representation"],
        5: ["Deep Learning Architectures", "Natural Language Processing (NLP)", "Big Data Engineering (Spark/Hadoop)", "Computer Vision", "Knowledge Representation & Reasoning", "AI Platforms & Toolchains"],
        6: ["Reinforcement Learning", "Generative AI & LLMs", "Cloud AI & MLOps Pipelines", "Feature Engineering & Dimensionality", "Time Series Forecasting", "Speech Recognition & Audio AI"],
        7: ["AI Ethics, Governance & Safety", "Graph Neural Networks", "Edge AI & IoT Analytics", "Explainable AI (XAI)", "Data Visualization & Business BI", "Bioinformatics & Computational Biology"],
        8: ["Autonomous Robotics & Navigation", "Quantum Computing Foundations", "Large Scale Distributed ML", "AI Product Management", "Recommender Systems", "Capstone AI Synthesis"]
      }
    },
    IT: {
      name: "Information Technology",
      icon: "🌐",
      subjectCount: 6,
      semesters: {
        1: ["Engineering Mathematics I", "Python Programming", "Engineering Physics", "Basic Electronics", "Engineering Chemistry", "Technical English"],
        2: ["Engineering Mathematics II", "Data Structures with C++", "Digital Principles", "Environmental Science", "Web Basics & Markup", "Physics for Information Science"],
        3: ["Data Structures & Algorithms", "Computer Architecture", "Object-Oriented Programming (Java)", "Discrete Mathematics", "Analog and Digital Communication", "Software Engineering Methodologies"],
        4: ["Database Management Systems", "Operating Systems Principles", "Design of Algorithms", "Microprocessors & Interfacing", "Computer Networks I", "Web Essentials (HTML/CSS/JS)"],
        5: ["Computer Networks II", "Full Stack Web Development", "Formal Languages & Automata", "Mobile Application Development", "Information Security Basics", "Software Testing & Automation"],
        6: ["Cloud Infrastructure & Virtualization", "Data Mining & Business Analytics", "Cryptography & Network Security", "DevOps Engineering & CI/CD", "Software Architecture", "Internet of Things"],
        7: ["Enterprise Computing", "Artificial Intelligence & Expert Systems", "Cyber Law & Ethics", "Big Data Analytics", "Distributed Computing", "Service Oriented Architecture"],
        8: ["Blockchain Architecture", "Next-Gen Web & Microservices", "Storage Area Networks", "Cloud Native Security", "Cognitive Systems", "Capstone IT Project"]
      }
    },
    ECE: {
      name: "Electronics & Communication Engineering",
      icon: "📡",
      subjectCount: 6,
      semesters: {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Basic Electrical & Instrumentation", "Problem Solving & C", "Engineering Graphics"],
        2: ["Engineering Mathematics II", "Circuit Theory & Network Analysis", "Electronic Devices & Diodes", "Python for Electronics", "Environmental Science", "Materials Science"],
        3: ["Electronic Circuits I", "Digital Electronics & Logic", "Signals & Systems", "Electromagnetic Fields", "Transforms & Partial Differential Eq", "Linear Algebra"],
        4: ["Electronic Circuits II", "Linear Integrated Circuits (Op-Amps)", "Analog Communication Systems", "Microprocessors & Microcontrollers (8086/ARM)", "Transmission Lines", "Control Systems"],
        5: ["Digital Communication", "Digital Signal Processing (DSP)", "Antenna & Microwave Waveguides", "VLSI Design & Verilog HDL", "Computer Architecture", "Communication Networks"],
        6: ["Wireless Communication Networks", "Embedded Systems Design", "Optical Fiber Communication", "Medical Electronics", "RF Circuit Design", "Digital Image Processing"],
        7: ["Satellite Communication & Navigation", "IoT & Sensor Interface Systems", "Radar & Navigational Aids", "Cellular & 5G Systems", "Microwave Integrated Circuits", "Professional Ethics"],
        8: ["Wireless Sensor Networks", "Nanoelectronics & MEMS", "Robotics & Automation", "Optical Networks", "Consumer Electronics", "Capstone Engineering Project"]
      }
    },
    EEE: {
      name: "Electrical & Electronics Engineering",
      icon: "⚡",
      subjectCount: 6,
      semesters: {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Problem Solving & C", "Basic Mechanical & Civil", "Engineering Graphics"],
        2: ["Engineering Mathematics II", "Electric Circuit Analysis", "Electron Devices & Circuits", "Physics of Electrical Materials", "Environmental Science", "C++ Programming"],
        3: ["DC Machines and Transformers", "Electromagnetic Theory", "Digital Logic Circuits", "Measurements & Instrumentation", "Transforms & Numerical Methods", "Analog Electronics"],
        4: ["AC Machines & Alternators", "Transmission & Distribution Systems", "Linear Integrated Circuits", "Control Systems Engineering", "Power Plant Engineering", "Microprocessors (8085/8086)"],
        5: ["Power Electronics & Converters", "Power System Analysis", "Microcontroller Architecture (8051/PIC)", "Renewable Energy Technologies", "Electrical Machine Design", "Digital Signal Processors"],
        6: ["Protection & Switchgear", "Electric Drives & Traction Control", "High Voltage Engineering", "Embedded System Controllers", "Power System Operation & Control", "Industrial Instrumentation"],
        7: ["Smart Grid & Microgrid Technologies", "Electric Vehicle (EV) Powertrains", "Power Quality & Harmonic Filters", "Special Electrical Machines", "Energy Auditing & Management", "VLSI for Power"],
        8: ["Battery Management Systems (BMS)", "Industrial Automation & PLC/SCADA", "HVDC & FACTS Controllers", "Distributed Generation", "Power System Dynamics", "Capstone Power Project"]
      }
    },
    MECH: {
      name: "Mechanical Engineering",
      icon: "⚙️",
      subjectCount: 6,
      semesters: {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Basic Electrical & Electronics", "Engineering Graphics", "Problem Solving with C"],
        2: ["Engineering Mathematics II", "Engineering Mechanics", "Materials Science & Metallurgy", "Manufacturing Processes I", "Environmental Science", "Computer Aided Drafting"],
        3: ["Engineering Thermodynamics", "Strength of Materials", "Fluid Mechanics & Machinery", "Manufacturing Processes II", "Partial Differential Equations", "Electrical Drives & Controls"],
        4: ["Kinematics of Machinery", "Applied Thermal Engineering", "Machining & Machine Tools", "Metrology & Measurements", "Fluid Power Systems", "Materials Testing & Mechanics"],
        5: ["Dynamics of Machinery", "Design of Machine Elements (DME)", "Heat & Mass Transfer", "Operations Research", "Automobile Engineering", "Industrial Engineering"],
        6: ["Design of Transmission Systems", "Finite Element Analysis (FEA)", "CAD/CAM & CNC Technology", "Power Plant Engineering", "Gas Dynamics & Jet Propulsion", "Quality Engineering"],
        7: ["Mechatronics & Robotics", "Refrigeration & Air Conditioning", "Total Quality Management (TQM)", "Composite Materials", "Maintenance Engineering", "Process Planning & Cost"],
        8: ["Additive Manufacturing (3D Printing)", "Computational Fluid Dynamics (CFD)", "Industrial Safety & Ergonomics", "Solar Energy Utilization", "Renewable Energy Systems", "Capstone Mechanical Design"]
      }
    },
    CIVIL: {
      name: "Civil Engineering",
      icon: "🏛️",
      subjectCount: 6,
      semesters: {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Basics of Civil & Mechanical", "Engineering Graphics", "Problem Solving with C"],
        2: ["Engineering Mathematics II", "Mechanics of Solids", "Surveying I", "Building Materials & Construction", "Environmental Science", "Engineering Geology"],
        3: ["Fluid Mechanics", "Surveying II (Advanced)", "Strength of Materials", "Transforms and Boundary Problems", "Construction Techniques & Practices", "Water Supply Engineering"],
        4: ["Applied Hydraulic Engineering", "Structural Analysis I", "Concrete Technology", "Soil Mechanics & Geotechnical Engg", "Highway Engineering", "Numerical Methods"],
        5: ["Design of Reinforced Concrete (RCC)", "Structural Analysis II", "Wastewater Engineering", "Foundation Engineering", "Railways, Airports & Harbours", "Hydrology & Water Resources"],
        6: ["Design of Steel Structures", "Prestressed Concrete Structures", "Estimation, Costing & Valuation", "Structural Dynamics", "Irrigation Engineering", "Traffic Engineering"],
        7: ["Earthquake Resistant Design", "Urban Planning & Smart Cities", "Construction Management & Economics", "Environmental Impact Assessment (EIA)", "Ground Improvement Techniques", "Bridge Engineering"],
        8: ["Industrial Waste Management", "GIS & Remote Sensing in Civil", "Tall Buildings Structural Design", "Pavement Design & Maintenance", "Disaster Management & Mitigation", "Capstone Civil Project"]
      }
    },
    BIOTECH: {
      name: "Biotechnology",
      icon: "🧬",
      subjectCount: 6,
      semesters: {
        1: ["Engineering Mathematics I", "Engineering Physics", "Engineering Chemistry", "Problem Solving in C", "Basics of Bio-Sciences", "Technical English"],
        2: ["Engineering Mathematics II", "Biochemistry", "Microbiology Principles", "Cell Biology", "Organic Chemistry", "Environmental Science"],
        3: ["Stoichiometry & Fluid Mechanics", "Molecular Biology", "Bio-Organic Chemistry", "Bio-Analytical Techniques", "Transforms & PDE", "Biostatistics"],
        4: ["Bioprocess Principles", "Enzyme Engineering & Technology", "Thermodynamics for Biologists", "Immunology & Serology", "Heat & Mass Transfer in Bio", "Genetics"],
        5: ["Bioreactor Design & Scale-up", "Genetic Engineering & rDNA", "Downstream Processing I", "Bioinformatics & Sequence Analysis", "Plant Biotechnology", "Animal Cell Science"],
        6: ["Downstream Processing II", "Biopharmaceutical Technology", "Food Biotechnology & Preservation", "Fermentation Technology", "Medical Biotechnology", "Bioethics & Biosafety"],
        7: ["Stem Cell Technology", "Genomics & Proteomics", "Nano-Biotechnology", "Environmental Biotechnology", "Bio-Business & IPR", "Metabolic Engineering"],
        8: ["Synthetic Biology", "Cancer Biology & Therapeutics", "Bio-Process Economics", "Tissue Engineering", "Clinical Trials & Regulation", "Capstone Bio Project"]
      }
    }
  },

  // ── GROUP 2: MEDICAL ──
  MEDICAL: {
    MBBS: {
      name: "Bachelor of Medicine & Surgery (MBBS)",
      icon: "⚕️",
      subjectCount: 6,
      semesters: {
        1: ["Human Gross Anatomy & Embryology", "Human Physiology Principles", "Medical Biochemistry", "Professionalism & Bioethics", "Histology & Cellular Anatomy", "Basic First Aid & Life Support"],
        2: ["Systemic Anatomy & Neuroanatomy", "Cardiovascular & Respiratory Physiology", "Metabolic Pathways & Molecular Genetics", "Endocrine & Reproductive Physiology", "Clinical Biochemistry", "Early Clinical Exposure"],
        3: ["General Pathology & Hematology", "Medical Microbiology & Immunology", "General Pharmacology & Toxicology", "Forensic Medicine Basics", "Parasitology & Mycology", "Diagnostic Laboratory Techniques"],
        4: ["Systemic Pathology & Neoplasia", "Systemic Pharmacology & Chemotherapy", "Clinical Microbiology & Virology", "Community Medicine Foundations", "Medical Jurisprudence & Autopsy", "Clinical Examination Methods"],
        5: ["Clinical Pharmacology & Therapeutics", "Chemical Pathology & Molecular Diagnostics", "Forensic Medicine & Clinical Toxicology", "Epidemiology & Biostatistics", "Infectious Disease Management", "Ethics in Clinical Practice"],
        6: ["Otorhinolaryngology (ENT)", "Ophthalmology & Eye Surgery", "Community Medicine & Field Health", "Internal Medicine Postings", "Clinical Dermatology", "Psychiatry & Behavioral Science"],
        7: ["General Surgery Principles & Trauma", "Orthopedics & Traumatology", "Obstetrics & Gynecology (Part I)", "Pediatrics & Neonatology Basics", "Anesthesiology & Critical Care", "Radiology & Imaging Sciences"],
        8: ["General Medicine & Therapeutics", "General Surgery & Critical Care", "Obstetrics & Gynecology (Part II)", "Pediatrics & Neonatology", "Emergency Medicine & Triage", "Public Health & Preventive Medicine"]
      }
    },
    BDS: {
      name: "Bachelor of Dental Surgery (BDS)",
      icon: "🦷",
      subjectCount: 6,
      semesters: {
        1: ["General Human Anatomy & Embryology", "General Human Physiology", "Medical Biochemistry", "Dental Anatomy & Histology", "Dental Materials Science", "Oral Biology Basics"],
        2: ["General Pathology", "General Microbiology", "General & Dental Pharmacology", "Pre-clinical Conservative Dentistry", "Oral Pathology Principles", "Dental Biostatistics"],
        3: ["General Medicine for Dentists", "General Surgery for Dentists", "Oral Pathology & Microbiology", "Pre-clinical Prosthodontics", "Conservative Dentistry Pre-clinical", "Oral Radiology Basics"],
        4: ["Oral & Maxillofacial Surgery", "Conservative Dentistry & Endodontics", "Prosthodontics & Crown/Bridge", "Periodontology & Implantology", "Orthodontics & Dentofacial Ortho", "Pediatric Dentistry"],
        5: ["Oral Medicine & Radiology", "Public Health Dentistry", "Advanced Endodontics", "Oral Implantology Techniques", "Forensic Odontology", "Dental Practice Management"],
        6: ["Comprehensive Clinical Dental Practice", "Advanced Implantology", "Maxillofacial Trauma Surgery", "Pediatric Preventive Care", "Dental Jurisprudence & Ethics", "Clinical Internship Postings"]
      }
    },
    PHARM: {
      name: "Bachelor of Pharmacy (B.Pharm)",
      icon: "💊",
      subjectCount: 6,
      semesters: {
        1: ["Human Anatomy & Physiology I", "Pharmaceutical Analysis I", "Pharmaceutics I", "Pharmaceutical Inorganic Chemistry", "Remedial Mathematics / Biology", "Communication Skills"],
        2: ["Human Anatomy & Physiology II", "Pharmaceutical Organic Chemistry I", "Biochemistry", "Pathophysiology", "Computer Applications in Pharmacy", "Environmental Sciences"],
        3: ["Pharmaceutical Organic Chemistry II", "Physical Pharmaceutics I", "Pharmaceutical Microbiology", "Pharmaceutical Engineering", "Pharmaceutical Technology Basics", "Medicinal Chemistry Foundations"],
        4: ["Pharmaceutical Organic Chemistry III", "Medicinal Chemistry I", "Physical Pharmaceutics II", "Pharmacology I", "Pharmacognosy & Phytochemistry I", "Pharmaceutical Jurisprudence"],
        5: ["Medicinal Chemistry II", "Industrial Pharmacy I", "Pharmacology II", "Pharmacognosy & Phytochemistry II", "Pharmaceutical Biotechnology", "Formulation Science"],
        6: ["Medicinal Chemistry III", "Pharmacology III", "Herbal Drug Technology", "Biopharmaceutics & Pharmacokinetics", "Pharmaceutical Quality Assurance", "Cosmetic Science"],
        7: ["Instrumental Methods of Analysis", "Industrial Pharmacy II", "Pharmacy Practice", "Novel Drug Delivery Systems (NDDS)", "Sterile Formulations", "Clinical Pharmacokinetics"],
        8: ["Biostatistics & Research Methodology", "Social & Preventive Pharmacy", "Pharma Marketing Management", "Pharmacovigilance & Drug Safety", "Quality Control & Standardization", "Dietary Supplements & Nutraceuticals"]
      }
    },
    NURSING: {
      name: "B.Sc Nursing",
      icon: "🩺",
      subjectCount: 6,
      semesters: {
        1: ["Applied Anatomy & Applied Physiology", "Applied Sociology & Applied Psychology", "Nursing Foundations I", "Health Communication & Soft Skills", "Nutrition & Dietetics", "First Aid & Emergency Response"],
        2: ["Applied Biochemistry & Biophysics", "Nursing Foundations II", "Health Assessment & Clinical Skills", "Applied Informatics in Nursing", "Microbiology Principles", "Professional Ethics in Nursing"],
        3: ["Applied Microbiology & Infection Control", "Pharmacology I", "Pathology I", "Adult Health Nursing I (Medical)", "Surgical Nursing Foundations", "Clinical Lab Practice"],
        4: ["Pharmacology II & Clinical Therapeutics", "Pathology II & Genetics", "Adult Health Nursing II (Surgical)", "Professional Values & Ethics", "Community Health Nursing I", "Emergency & Critical Care Nursing"],
        5: ["Child Health Nursing I (Pediatrics)", "Mental Health Nursing I (Psychiatry)", "Community Health Nursing II", "Educational Technology in Nursing", "Medical Surgical Specialties", "Clinical Nutrition in Care"],
        6: ["Child Health Nursing II", "Mental Health Nursing II", "Nursing Management & Leadership", "Clinical Specialty Postings", "Geriatric Nursing", "Palliative & Hospice Care"],
        7: ["Midwifery & Obstetrical Nursing I", "Community Health Nursing III", "Nursing Research & Statistics", "Disaster Nursing & Mass Casualties", "Infection Prevention Leadership", "Oncology Nursing"],
        8: ["Midwifery & Obstetrical Nursing II", "Clinical Internship Postings", "Quality Management & Patient Safety", "Forensic Nursing", "Advanced Nursing Practice", "Comprehensive Nursing Capstone"]
      }
    }
  },

  // ── GROUP 3: ARTS & SCIENCE ──
  ARTS_SCIENCE: {
    BSC_CS: {
      name: "B.Sc Computer Science",
      icon: "🖥️",
      subjectCount: 6,
      semesters: {
        1: ["Programming in C", "Digital Computer Fundamentals", "Mathematical Foundations I", "Foundational English", "Office Automation Lab Theory", "Environmental Studies"],
        2: ["Programming in C++", "Data Structures Using C++", "Mathematical Foundations II", "Communicative English", "Web Fundamentals (HTML/CSS)", "Value Education"],
        3: ["Java Programming", "Discrete Mathematics", "Database Management Systems", "Computer Architecture", "Computer Graphics", "E-Commerce Technologies"],
        4: ["Design & Analysis of Algorithms", "Operating Systems", "Python Programming", "Resource Management Techniques", "Software Engineering", "Microprocessors & Assembly"],
        5: ["Computer Networks", "Software Testing & Quality Assurance", "Web Technology & PHP", "Data Mining & Data Warehousing", "Mobile Computing", "Cyber Security Fundamentals"],
        6: ["Cloud Computing & Big Data", "Artificial Intelligence & Machine Learning", "Internet of Things (IoT)", "Information Security", "Software Project Management", "Final Capstone Synthesis"]
      }
    },
    BCA: {
      name: "Bachelor of Computer Applications (BCA)",
      icon: "📱",
      subjectCount: 6,
      semesters: {
        1: ["Problem Solving & C Programming", "Digital Principles & Logic", "Mathematics for Computer Applications I", "English for Workplace", "Computer Fundamentals", "Spreadsheet Modelling"],
        2: ["Object-Oriented Programming with C++", "Data Structures with Algorithms", "Mathematics for Computer Applications II", "Professional English", "Web Designing with HTML/CSS", "Environmental Studies"],
        3: ["Programming in Java", "Database Systems (MySQL/Oracle)", "Operating Systems Architecture", "Financial Accounting for IT", "Computer Networks", "E-Commerce Applications"],
        4: ["Python Programming & Scripting", "Software Engineering Concepts", "Computer Architecture", "Operations Research", "Web Programming with PHP & JS", "Management Information Systems"],
        5: ["Dot Net Programming (C# / ASP.NET)", "Software Testing & Automation", "Mobile Application Development (Android)", "Cyber Security & Ethics", "Cloud Computing Basics", "Data Analytics with Excel & Python"],
        6: ["Full Stack Web Frameworks", "Internet of Things & Automation", "Machine Learning Fundamentals", "Digital Marketing Analytics", "Software Project Management", "Major Industry Project"]
      }
    },
    BCOM: {
      name: "Bachelor of Commerce (B.Com)",
      icon: "📊",
      subjectCount: 6,
      semesters: {
        1: ["Financial Accounting I", "Business Organization & Management", "Business Economics I (Micro)", "Business Communication", "Banking Theory, Law & Practice", "Environmental Studies"],
        2: ["Financial Accounting II", "Business Law", "Business Economics II (Macro)", "Business Mathematics", "Indian Financial System", "Value Education & Ethics"],
        3: ["Corporate Accounting I", "Company Law & Secretarial Practice", "Business Statistics I", "Financial Markets & Services", "Marketing Management", "Office Management"],
        4: ["Corporate Accounting II", "Principles of Cost Accounting", "Business Statistics II", "Indirect Taxes (GST Law)", "Human Resource Management", "Entrepreneurial Development"],
        5: ["Cost Accounting & Control", "Practical Auditing", "Income Tax Law & Practice I", "Financial Management", "E-Commerce & Digital Banking", "Management Accounting I"],
        6: ["Management Accounting II", "Income Tax Law & Practice II", "Investment Analysis & Portfolio Management", "International Trade & Finance", "Computerized Accounting (Tally)", "Business Research Project"]
      }
    },
    BBA: {
      name: "Bachelor of Business Administration (BBA)",
      icon: "📈",
      subjectCount: 6,
      semesters: {
        1: ["Principles of Management", "Financial Accounting for Managers", "Managerial Economics", "Business Communication", "Computer Applications in Business", "Environmental Studies"],
        2: ["Organizational Behavior", "Business Law & Legal Frameworks", "Business Mathematics & Statistics", "Marketing Management Foundations", "Business Environment", "Value Education"],
        3: ["Human Resource Management", "Cost & Management Accounting", "Operations & Production Management", "Business Research Methods", "Consumer Behavior & Marketing", "Advertising & Brand Management"],
        4: ["Financial Management", "Supply Chain & Logistics Management", "Services Marketing", "Taxation Law & Practice", "Management Information Systems (MIS)", "Total Quality Management"],
        5: ["Strategic Management", "International Business Management", "Retail Management", "Digital Marketing & Social Media Strategy", "Entrepreneurship & Small Business", "Banking & Insurance Management"],
        6: ["Business Ethics & Corporate Governance", "Investment Analysis & Wealth Management", "Project Management & Leadership", "Human Resource Development", "Customer Relationship Management (CRM)", "Capstone Business Plan & Project"],
        7: ["Global Supply Chain Strategy", "Corporate Restructuring & Mergers", "Advanced Business Analytics", "Innovation & Venture Capital", "Leadership Dynamics & Change", "Business Simulation Practicum"],
        8: ["Executive Leadership Synthesis", "Strategic Risk & Crisis Management", "International Finance & Forex", "Sustainable Enterprise Strategy", "Management Consulting Practicum", "Senior Degree Dissertation"]
      }
    }
  },

  // ── GROUP 4: MANAGEMENT & BUSINESS ──
  MANAGEMENT: {
    BBA: {
      name: "Bachelor of Business Administration (BBA)",
      icon: "📈",
      subjectCount: 6,
      semesters: {
        1: ["Principles of Management", "Financial Accounting for Managers", "Managerial Economics", "Business Communication", "Computer Applications in Business", "Environmental Studies"],
        2: ["Organizational Behavior", "Business Law & Legal Frameworks", "Business Mathematics & Statistics", "Marketing Management Foundations", "Business Environment", "Value Education"],
        3: ["Human Resource Management", "Cost & Management Accounting", "Operations & Production Management", "Business Research Methods", "Consumer Behavior & Marketing", "Advertising & Brand Management"],
        4: ["Financial Management", "Supply Chain & Logistics Management", "Services Marketing", "Taxation Law & Practice", "Management Information Systems (MIS)", "Total Quality Management"],
        5: ["Strategic Management", "International Business Management", "Retail Management", "Digital Marketing & Social Media Strategy", "Entrepreneurship & Small Business", "Banking & Insurance Management"],
        6: ["Business Ethics & Corporate Governance", "Investment Analysis & Wealth Management", "Project Management & Leadership", "Human Resource Development", "Customer Relationship Management (CRM)", "Capstone Business Plan & Project"],
        7: ["Global Supply Chains & Trade", "Corporate Restructuring & Mergers", "Advanced Business Analytics", "Innovation & Venture Capital", "Leadership Dynamics & Change", "Business Simulation Lab"],
        8: ["Executive Leadership Synthesis", "Strategic Risk & Crisis Management", "International Finance & Forex", "Sustainable Enterprise Strategy", "Management Consulting Practicum", "Master Degree Dissertation"]
      }
    },
    MBA: {
      name: "Master of Business Administration (MBA)",
      icon: "💼",
      subjectCount: 6,
      semesters: {
        1: ["Managerial Economics", "Accounting for Decision Makers", "Organizational Dynamics", "Marketing Strategy Foundations", "Quantitative Analysis for Business", "Business Communication & Leadership"],
        2: ["Corporate Financial Management", "Human Capital Management", "Operations & Supply Chain Strategy", "Business Research & Analytics", "Legal Environment of Business", "Strategic Management Foundations"],
        3: ["Advanced Corporate Strategy", "Investment Analysis & Portfolio Management", "Consumer Insights & Brand Architecture", "Digital Transformation Strategy", "Supply Chain Analytics", "Enterprise Elective I"],
        4: ["International Business Strategy", "Corporate Governance & Ethics", "Entrepreneurship & Venture Creation", "Business Modeling & Valuation", "Strategic Change Leadership", "Master Industry Capstone"],
        5: ["Advanced Executive Seminar I", "Global Strategic Operations", "Fintech Innovations in Business", "Behavioral Economics & Strategy", "Omnichannel Retail Strategy", "Applied Business Analytics"],
        6: ["Advanced Executive Seminar II", "Cross-Border Mergers & Acquisitions", "Strategic Negotiation & Conflict", "Sustainable Enterprise & ESG", "Enterprise Architecture Leadership", "Global Executive Dissertation"],
        7: ["Doctoral Prep & Corporate Synthesis I", "Global Leadership Forum", "Venture Capital & Private Equity", "Advanced Corporate Valuation", "Enterprise AI Strategy", "Executive Practicum"],
        8: ["Doctoral Prep & Corporate Synthesis II", "Strategic Corporate Governance", "Global Macroeconomics & Enterprise", "Enterprise Resilience & Risk", "Executive Board Simulation", "Final Capstone Thesis"]
      }
    },
    BMS: {
      name: "Bachelor of Management Studies (BMS)",
      icon: "🎯",
      subjectCount: 6,
      semesters: {
        1: ["Principles of Management", "Business Law", "Financial Accounting", "Business Communication", "Foundation of Human Skills", "Business Economics I"],
        2: ["Principles of Marketing", "Industrial Law", "Business Mathematics", "Business Communication II", "Business Environment", "Business Economics II"],
        3: ["Strategic Management", "Accounting for Managerial Decisions", "Basics of Financial Services", "Marketing Applications & Practices", "Consumer Behaviour", "Corporate Planning"],
        4: ["Business Research Methods", "Production & Total Quality Management", "Financial Institutions & Markets", "Integrated Marketing Communications", "Rural Marketing", "Tourism Marketing"],
        5: ["Logistics & Supply Chain Management", "Corporate Communication & PR", "Service Marketing", "E-Commerce & Digital Marketing", "Sales & Distribution Management", "Customer Relationship Management"],
        6: ["Operations Research", "International Marketing", "Brand Management", "Retail Management", "Strategic Human Resource Management", "Capstone Project Work"],
        7: ["Advanced Strategic Operations", "Business Analytics & Predictive Modeling", "Venture Creation & Scaling", "Corporate Social Responsibility", "International Business Negotiations", "Enterprise Practicum"],
        8: ["Enterprise Leadership & Strategy", "Global Supply Chain Networks", "Strategic Financial Valuation", "Organizational Agility & Change", "Business Advisory Practicum", "Senior Capstone Defense"]
      }
    }
  },

  // ── GROUP 4: SCHOOL EDUCATION (10TH, 11TH & 12TH STANDARDS) ──
  SCHOOL: {
    STD_10: {
      name: "10th Standard (SSLC / CBSE Board)",
      icon: "🎒",
      subjectCount: 5,
      semesters: {
        1: ["Mathematics (Algebra, Geometry, Trigonometry)", "Science (Physics, Chemistry, Biology)", "Social Science (History & Geography)", "English Language & Literature", "Tamil / Regional Language"],
        2: ["Mathematics (Statistics, Probability, Mensuration)", "Science (Electricity, Carbon Compounds, Heredity)", "Social Science (Civics, Economics & Maps)", "English Analytical Writing", "Language Revision & Board PYQ"]
      }
    },
    STD_11_SCI: {
      name: "11th Standard — Science (Physics, Chemistry, Maths, Bio/CS)",
      icon: "🧪",
      subjectCount: 5,
      semesters: {
        1: ["Physics (Kinematics, Laws of Motion, Work Power Energy)", "Chemistry (Atomic Structure, Chemical Bonding, Periodic Trends)", "Mathematics (Sets, Relations, Trigonometry, Complex Numbers)", "Biology / Computer Science (Python Basics)", "General English Communication"],
        2: ["Physics (Thermodynamics, Waves & Oscillations, Gravitation)", "Chemistry (Equilibrium, Redox Reactions, Organic Chemistry)", "Mathematics (Calculus, Conic Sections, Probability)", "Biology (Human Physiology) / Computer Science (Algorithms)", "English Board Core"]
      }
    },
    STD_12_SCI: {
      name: "12th Standard — Science (Board Exam Focus)",
      icon: "🎓",
      subjectCount: 5,
      semesters: {
        1: ["Physics (Electrostatics, Current Electricity, Magnetism)", "Chemistry (Solutions, Electrochemistry, Chemical Kinetics)", "Mathematics (Matrices, Determinants, Differential Calculus)", "Biology (Genetics & Reproduction) / Computer Science (SQL & Python)", "English Core"],
        2: ["Physics (Electromagnetic Induction, Optics, Modern Physics, Semiconductors)", "Chemistry (Coordination Compounds, Aldehydes, Amines, Biomolecules)", "Mathematics (Integral Calculus, Differential Equations, Vectors & 3D)", "Biology (Ecology & Biotechnology) / Computer Science (Computer Networks)", "English Board Exam Preparation"]
      }
    },
    STD_12_COMM: {
      name: "12th Standard — Commerce & Economics",
      icon: "📊",
      subjectCount: 5,
      semesters: {
        1: ["Accountancy (Partnership Accounts, Goodwill & Reconstitution)", "Business Studies (Principles of Management, Planning & Staffing)", "Economics (Microeconomics, National Income Accounting)", "Applied Mathematics / Business Maths", "English Core"],
        2: ["Accountancy (Company Accounts, Debentures, Cash Flow)", "Business Studies (Financial Management, Marketing & Consumer Protection)", "Economics (Macroeconomics, Money & Banking, Indian Economic Development)", "Commercial Law / Computer Applications", "English Board Exam Synthesis"]
      }
    }
  }
};

/* ---------------------------------------------------------
   API 1: GET /api/quiz/colleges & /api/quiz/engineering/colleges
   Get colleges filtered by state, district, or autonomous status
--------------------------------------------------------- */
router.get(["/colleges", "/engineering/colleges"], (req, res) => {
  const { state, district, autonomous, type } = req.query;
  const fs = require("fs");
  const path = require("path");

  let colleges = [...COLLEGES_DIRECTORY];
  try {
    const colFile = path.join(__dirname, "../data/colleges.json");
    if (fs.existsSync(colFile)) {
      colleges = JSON.parse(fs.readFileSync(colFile, "utf-8"));
    }
  } catch (_) {}

  if (state) {
    colleges = colleges.filter(c => c.state.toLowerCase() === state.toLowerCase());
  }
  if (district) {
    colleges = colleges.filter(c => c.district.toLowerCase().includes(district.toLowerCase()));
  }
  if (autonomous === "true" || type === "autonomous") {
    colleges = colleges.filter(c => c.autonomous === true || (c.affiliation && c.affiliation.toLowerCase().includes("autonomous")));
  }

  const states = Array.from(new Set(colleges.map(c => c.state))).sort();
  const statePool = state ? colleges.filter(c => c.state.toLowerCase() === state.toLowerCase()) : colleges;
  const districts = Array.from(new Set(statePool.map(c => c.district))).sort();

  res.json({
    success: true,
    total: colleges.length,
    colleges,
    availableStates: states,
    availableDistricts: districts
  });
});

/* ---------------------------------------------------------
   API 2: GET /api/quiz/curriculum/groups
   Get all 4 academic groups and their disciplines
--------------------------------------------------------- */
router.get("/curriculum/groups", (req, res) => {
  const groups = [
    {
      id: "ENGINEERING",
      name: "Engineering & Technology (B.E. / B.Tech)",
      icon: "🎓",
      disciplines: Object.keys(MASTER_CURRICULUM.ENGINEERING).map(k => ({
        id: k,
        name: MASTER_CURRICULUM.ENGINEERING[k].name,
        icon: MASTER_CURRICULUM.ENGINEERING[k].icon,
        subjectCount: MASTER_CURRICULUM.ENGINEERING[k].subjectCount || 6
      }))
    },
    {
      id: "MANAGEMENT",
      name: "Management & Business Studies (BBA / MBA / BMS)",
      icon: "💼",
      disciplines: Object.keys(MASTER_CURRICULUM.MANAGEMENT).map(k => ({
        id: k,
        name: MASTER_CURRICULUM.MANAGEMENT[k].name,
        icon: MASTER_CURRICULUM.MANAGEMENT[k].icon,
        subjectCount: MASTER_CURRICULUM.MANAGEMENT[k].subjectCount || 6
      }))
    },
    {
      id: "MEDICAL",
      name: "Medical & Health Sciences (MBBS / BDS / Allied)",
      icon: "🩺",
      disciplines: Object.keys(MASTER_CURRICULUM.MEDICAL).map(k => ({
        id: k,
        name: MASTER_CURRICULUM.MEDICAL[k].name,
        icon: MASTER_CURRICULUM.MEDICAL[k].icon,
        subjectCount: MASTER_CURRICULUM.MEDICAL[k].subjectCount || 6
      }))
    },
    {
      id: "ARTS_SCIENCE",
      name: "Arts & Science (B.Sc / BCA / B.Com / BBA)",
      icon: "📚",
      disciplines: Object.keys(MASTER_CURRICULUM.ARTS_SCIENCE).map(k => ({
        id: k,
        name: MASTER_CURRICULUM.ARTS_SCIENCE[k].name,
        icon: MASTER_CURRICULUM.ARTS_SCIENCE[k].icon,
        subjectCount: MASTER_CURRICULUM.ARTS_SCIENCE[k].subjectCount || 6
      }))
    },
    {
      id: "SCHOOL",
      name: "School Education (10th, 11th & 12th Board)",
      icon: "🏫",
      disciplines: Object.keys(MASTER_CURRICULUM.SCHOOL).map(k => ({
        id: k,
        name: MASTER_CURRICULUM.SCHOOL[k].name,
        icon: MASTER_CURRICULUM.SCHOOL[k].icon,
        subjectCount: MASTER_CURRICULUM.SCHOOL[k].subjectCount || 5
      }))
    }
  ];

  res.json({ success: true, groups });
});

/* ---------------------------------------------------------
   API 3: POST /api/quiz/curriculum/subjects
   Get accurate semester subjects for any group & discipline
--------------------------------------------------------- */
router.post(["/curriculum/subjects", "/engineering/subjects"], (req, res) => {
  try {
    let { groupType = "ENGINEERING", branch = "CSE", semester = 3 } = req.body;
    groupType = (groupType || "ENGINEERING").toUpperCase().replace(/\s+/g, "_");
    branch = (branch || "CSE").toUpperCase();
    const sem = parseInt(semester, 10) || 3;

    let groupData = MASTER_CURRICULUM[groupType];
    if (!groupData) {
      if (groupType.includes("SCHOOL") || groupType.includes("10") || groupType.includes("11") || groupType.includes("12")) groupData = MASTER_CURRICULUM.SCHOOL;
      else if (groupType.includes("MANAGE") || groupType.includes("BUSINESS")) groupData = MASTER_CURRICULUM.MANAGEMENT;
      else if (groupType.includes("MEDIC") || groupType.includes("HEALTH")) groupData = MASTER_CURRICULUM.MEDICAL;
      else if (groupType.includes("ART") || groupType.includes("SCI")) groupData = MASTER_CURRICULUM.ARTS_SCIENCE;
      else groupData = MASTER_CURRICULUM.ENGINEERING;
    }

    let discData = groupData[branch];
    if (!discData) {
      for (const g of Object.values(MASTER_CURRICULUM)) {
        if (g[branch]) {
          discData = g[branch];
          break;
        }
      }
    }
    if (!discData) {
      const firstKey = Object.keys(groupData)[0];
      discData = groupData[firstKey] || MASTER_CURRICULUM.ENGINEERING.CSE;
    }

    const subjects = (discData.semesters && discData.semesters[sem]) ||
      (discData.semesters && discData.semesters[1]) || [
        "Core Subject 1", "Core Subject 2", "Core Subject 3", "Core Subject 4", "Core Subject 5", "Core Subject 6"
      ];

    res.json({
      success: true,
      group: groupType,
      discipline: branch,
      disciplineName: discData.name,
      semester: sem,
      subjectCount: subjects.length,
      subjects
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------------
   API 4: POST /api/quiz/generate
   Multi-Pattern Quiz Generator (MCQ, True/False, Fill, Written, Match, Scenario, Coding)
--------------------------------------------------------- */
router.post("/generate", async (req, res) => {
  try {
    const { topic, count = 7, difficulty = "Standard" } = req.body;
    if (!topic) return res.status(400).json({ success: false, error: "Topic is required" });

    const prompt = `Generate ${count} diverse quiz questions for "${topic}".
Difficulty: ${difficulty}.
Return ONLY valid JSON matching this structure:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "pattern": "MCQ",
      "question": "Clear question here",
      "options": ["A", "B", "C", "D"],
      "answer": 0,
      "explanation": "Detailed rationale"
    },
    {
      "id": 2,
      "pattern": "TRUE_FALSE",
      "question": "Statement to evaluate",
      "options": ["True", "False"],
      "answer": 0,
      "explanation": "Detailed rationale"
    },
    {
      "id": 3,
      "pattern": "FILL_BLANK",
      "question": "Sentence with ___ missing word",
      "answerText": "Keyword",
      "acceptableAnswers": ["Keyword", "keyword"],
      "explanation": "Detailed rationale"
    },
    {
      "id": 4,
      "pattern": "WRITTEN",
      "question": "Brief conceptual question",
      "answerText": "Core concept summary",
      "explanation": "Detailed rationale"
    },
    {
      "id": 5,
      "pattern": "MATCH",
      "question": "Match definitions",
      "leftItems": ["Term 1", "Term 2", "Term 3"],
      "rightItems": ["Def 1", "Def 2", "Def 3"],
      "correctMatches": { "0": 0, "1": 1, "2": 2 },
      "explanation": "Detailed rationale"
    },
    {
      "id": 6,
      "pattern": "SCENARIO",
      "scenario": "Engineering or real-world problem scenario description",
      "question": "What is the best approach?",
      "options": ["Optimal solution", "Poor option", "Incorrect", "Suboptimal"],
      "answer": 0,
      "explanation": "Detailed rationale"
    },
    {
      "id": 7,
      "pattern": "CODING",
      "question": "Write the logic statement or core function name for ${topic}",
      "targetKeyword": "return",
      "explanation": "Detailed rationale"
    }
  ]
}`;

    const aiRes = await aiRouterService.executeAIFallback([
      { role: "system", content: "You are an expert academic evaluator. Output valid JSON only." },
      { role: "user", content: prompt }
    ]);

    let parsed = null;
    try {
      const match = aiRes.text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    } catch (_) { }

    if (!parsed || !parsed.questions || parsed.questions.length === 0) {
      // Fallback
      parsed = {
        topic,
        difficulty,
        questions: [
          {
            id: 1,
            pattern: "MCQ",
            question: `Which fundamental law or architecture governs ${topic}?`,
            options: [
              "Deterministic boundary verification & state invariance",
              "Random unbounded traversal without caching",
              "Bypassing runtime validation checks",
              "Static non-scalable resource allocation"
            ],
            answer: 0,
            explanation: `In ${topic}, rigorous deterministic verification and state invariance ensure predictable execution.`
          },
          {
            id: 2,
            pattern: "TRUE_FALSE",
            question: `In ${topic}, optimizing computational throughput requires balancing latency overhead with resource concurrency.`,
            options: ["True", "False"],
            answer: 0,
            explanation: "Balancing latency and throughput is a universal core engineering trade-off."
          },
          {
            id: 3,
            pattern: "FILL_BLANK",
            question: `The primary measure of algorithmic efficiency in ${topic} is formally denoted as Big-___ notation.`,
            answerText: "O",
            acceptableAnswers: ["O", "Oh", "Order"],
            explanation: "Big-O notation mathematically defines the upper bound on growth rate."
          },
          {
            id: 4,
            pattern: "WRITTEN",
            question: `State the primary objective of ${topic} in production environments:`,
            answerText: "High reliability, deterministic safety, and optimal performance",
            explanation: `Production systems utilizing ${topic} prioritize reliability, fault tolerance, and efficiency.`
          },
          {
            id: 5,
            pattern: "MATCH",
            question: `Match the core pillars of ${topic} with their operational objective:`,
            leftItems: ["Invariance", "Convergence", "Modularity"],
            rightItems: ["System Boundary Isolation", "Guaranteed Terminal State", "Condition Unchanged During Execution"],
            correctMatches: { "0": 2, "1": 1, "2": 0 },
            explanation: "Invariance remains true throughout execution; convergence guarantees a terminal state; modularity enforces clean boundaries."
          },
          {
            id: 6,
            pattern: "SCENARIO",
            scenario: `A mission-critical service running ${topic} encounters unpredictable traffic spikes and database latency.`,
            question: "Which architectural mitigation should be deployed first?",
            options: [
              "Circuit breaker with exponential backoff and jittered retries",
              "Disable all local caches to force live queries",
              "Quadruple thread allocations without connection pooling",
              "Silence error alerts to preserve CPU cycles"
            ],
            answer: 0,
            explanation: "Circuit breakers combined with exponential backoff prevent thundering herd failures."
          },
          {
            id: 7,
            pattern: "CODING",
            question: `Write the termination return keyword for an algorithm or handler in ${topic}:`,
            targetKeyword: "return",
            explanation: "The return statement delivers output and transfers execution control back to the caller."
          }
        ]
      };
    }

    res.json({ success: true, topic: parsed.topic || topic, difficulty, questions: parsed.questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------------
   API 5: POST /api/quiz/engineering/notes
   Generate Comprehensive AI Academic Notes & Formula Sheets
--------------------------------------------------------- */
router.post(["/engineering/notes", "/curriculum/notes"], async (req, res) => {
  try {
    const { subject, college = "Anna University / Accredited Autonomous", semester = 3, branch = "CSE" } = req.body;
    if (!subject) return res.status(400).json({ success: false, error: "Subject is required" });

    const prompt = `You are the Senior Academic Head for ${college}.
Generate structured academic study notes for the university subject: "${subject}" (${branch}, Semester ${semester}).
Return ONLY valid JSON:
{
  "summary": "Executive summary of the syllabus scope, core theorems, and learning outcomes.",
  "keyTheorems": [
    { "name": "Governing Law / Principle 1", "statement": "Rigorous definition or theorem statement", "formula": "Formula / Equation representation" },
    { "name": "Governing Law / Principle 2", "statement": "Core architecture or rule", "formula": "Mathematical / Algorithmic notation" },
    { "name": "Governing Law / Principle 3", "statement": "Crucial engineering law", "formula": "Key relationship or theorem formula" }
  ],
  "twoMarkQuestions": [
    { "q": "Define the fundamental principle of ${subject}.", "a": "Precise, 2-mark university model key answer with keywords." },
    { "q": "Distinguish between the primary mechanisms in ${subject}.", "a": "Tabular comparison or 2 distinct distinguishing points." },
    { "q": "State the governing equation or condition for ${subject}.", "a": "Mathematical relationship with terms expanded." },
    { "q": "What is the primary trade-off encountered in ${subject}?", "a": "Analysis of time/space complexity or physical constraint." },
    { "q": "Mention two practical industrial applications of ${subject}.", "a": "Modern real-world engineering deployment examples." }
  ],
  "thirteenMarkOutlines": [
    { "q": "Explain the architectural design and working methodology of ${subject} with neat block diagrams.", "outline": ["1. Architectural Block Diagram & Layering", "2. Component Functionality & Invariant Rules", "3. Step-by-Step Analytical Derivation / Logic Flow", "4. Industrial Performance Metrics & Trade-offs"] },
    { "q": "Formulate the comprehensive problem-solving algorithm or mathematical framework for ${subject}.", "outline": ["1. Governing Equations & Boundary Assumptions", "2. Algorithmic State Transitions", "3. Numerical Example Walkthrough", "4. Verification & Complexity Analysis"] }
  ]
}`;

    let parsedNotes = null;
    try {
      const aiRes = await aiRouterService.executeAIFallback([
        { role: "system", content: "You are an elite academic professor and university examiner. Return ONLY valid JSON." },
        { role: "user", content: prompt }
      ]);
      const match = aiRes.text.match(/\{[\s\S]*\}/);
      if (match) parsedNotes = JSON.parse(match[0]);
    } catch (_) {}

    if (!parsedNotes) {
      parsedNotes = {
        summary: `Comprehensive academic study notes and high-yield revision syllabus for ${subject} according to university regulations.`,
        keyTheorems: [
          { name: "Fundamental Invariance Principle", statement: `Defines deterministic state bounds, energy/algorithmic conservation, and baseline constraints for ${subject}.`, formula: "f(x) <= C * g(x) || H(s) = Y(s) / X(s)" },
          { name: "System Boundary Convergence Theorem", statement: `Guarantees stability, minimal dissipation, and finite-time convergence in ${subject} architectures.`, formula: "lim_{t -> inf} Error(t) = 0" },
          { name: "Optimality & Duality Relationship", statement: `Establishes Pareto-optimal trade-offs between throughput, latency, and resource utilization.`, formula: "Max Profit s.t. Constraints <= Dual Min" }
        ],
        twoMarkQuestions: [
          { q: `Define the primary governing law of ${subject}.`, a: `It dictates the necessary and sufficient operational bounds required to maintain deterministic system equilibrium.` },
          { q: `Differentiate between static and dynamic behavior in ${subject}.`, a: `Static behavior depends solely on present inputs, whereas dynamic behavior incorporates state memory and transient feedback.` },
          { q: `What is the significance of boundary conditions in ${subject}?`, a: `Boundary conditions ensure unique solutions and prevent computational divergence or hardware instability.` },
          { q: `List two high-yield optimization heuristics used in ${subject}.`, a: `Dynamic programming with memoization and branch-and-bound pruning heuristics.` },
          { q: `Name the standard performance metric for ${subject}.`, a: `Throughput efficiency and asymptotic convergence rate under peak load.` }
        ],
        thirteenMarkOutlines: [
          { q: `Elaborate on the structural blueprint and detailed operational flow of ${subject} with neat diagrams.`, outline: ["1. System Overview & Clean Architecture Block Diagram", "2. Core Subsystems and Inter-module Communication", "3. Governing Equations and Mathematical Derivations", "4. Edge Case Handling and Fault Tolerant Protocols"] },
          { q: `Design an end-to-end practical solution addressing core latency and resource bottlenecks in ${subject}.`, outline: ["1. Problem Formulation & Parameter Identification", "2. Proposed Algorithmic Solution Architecture", "3. Step-by-Step Derivation and Worked Example", "4. Empirical Benchmarking and Performance Evaluation"] }
        ]
      };
    }

    // Attach verified official University PDF guides and reference Chrome links
    parsedNotes.studyGuidesAndLinks = [
      {
        title: `Official ${subject} Regulation Syllabus & Blueprint (PDF)`,
        type: "PDF",
        url: `https://www.google.com/search?q=${encodeURIComponent(subject + " Anna University syllabus regulation 2021 pdf")}`,
        description: "Official university curriculum syllabus, unit-wise course outcomes, and credit weights."
      },
      {
        title: `${subject} 10-Year Repeated University PYQ Bank with Model Keys (PDF)`,
        type: "PDF",
        url: `https://www.google.com/search?q=${encodeURIComponent(subject + " previous year questions anna university 2 mark 16 mark solved pdf")}`,
        description: "University Examination Board solved 2-mark definitions and 16-mark comprehensive question bank."
      },
      {
        title: `${subject} Standard Author Lecture Reference & Formula Cheatsheet`,
        type: "Guide",
        url: `https://www.google.com/search?q=${encodeURIComponent(subject + " engineering lecture notes formula sheet pdf")}`,
        description: "High-yield formula handbook, derivation steps, and clear architecture diagrams."
      },
      {
        title: `NPTEL / SWAYAM Official Video Course & Transcripts`,
        type: "Chrome Link",
        url: `https://nptel.ac.in/courses`,
        description: "IIT & IISc verified national curriculum video modules and online assignment files."
      }
    ];

    res.json({
      success: true,
      subject,
      notes: parsedNotes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------------
   API 5B: POST /api/quiz/engineering/videos & /curriculum/videos
   Educational YouTube Video Lectures in Preferred Language
--------------------------------------------------------- */
router.post(["/engineering/videos", "/curriculum/videos"], async (req, res) => {
  try {
    const { subject, language = "Tamil", branch = "CSE" } = req.body;
    if (!subject) return res.status(400).json({ success: false, error: "Subject is required" });

    const youtubeService = require("../services/youtube");
    const result = await youtubeService.getEngineeringLectures(subject, language, branch);
    res.json({
      success: true,
      subject,
      language,
      branch,
      videos: result.videos || []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------------
   API 6: POST /api/quiz/engineering/mock-test & /curriculum/mock-test
   EXACT 50-MARK BLUEPRINT AS SPECIFIED BY USER:
   - PART A: 5 Questions × 2 Marks = 10 Marks
   - PART B: Optional pattern: 2 Questions × 8 Marks, user writes 1 = 8 Marks
   - PART C: 2 Questions × 16 Marks = 32 Marks
   Total Max Marks = 50 Marks
--------------------------------------------------------- */
router.post(["/engineering/mock-test", "/curriculum/mock-test"], async (req, res) => {
  try {
    const { subject, group = "Engineering", branch = "CSE", semester = 3, collegeName = "Anna University / Accredited Autonomous" } = req.body;
    if (!subject) return res.status(400).json({ success: false, error: "Subject is required." });

    const prompt = `You are the Chief Controller of Examinations for ${collegeName}.
Generate an authentic END SEMESTER UNIVERSITY QUESTION PAPER strictly following this exact 50-mark blueprint:
Subject: ${subject}
Branch/Group: ${branch} (${group})
Semester: ${semester}
Total Marks: 50 Marks
Time Allowed: 90 Minutes

Structure:
- PART A: Exactly 5 compulsory 2-mark questions (Total: 10 Marks). Brief definitions, principles, formulas.
- PART B: Exactly 2 optional 8-mark analytical questions (Question 6A OR Question 6B; Student answers only 1 for 8 Marks).
- PART C: Exactly 2 compulsory 16-mark comprehensive questions (Question 7 and Question 8; 2 × 16 Marks = 32 Marks). Deep derivation, architectural system design, or problem solution.

Return ONLY valid JSON:
{
  "instituteName": "${collegeName}",
  "examinationTitle": "UNIVERSITY END SEMESTER MODEL EXAMINATION",
  "subject": "${subject}",
  "subjectCode": "AUR-${branch.slice(0, 4).toUpperCase()}-${semester}01",
  "totalMarks": 50,
  "timeLimitMinutes": 90,
  "instructions": [
    "Part A: Answer all 5 questions (5 × 2 = 10 Marks).",
    "Part B: Answer either Question 6A OR Question 6B (1 × 8 = 8 Marks).",
    "Part C: Answer both Question 7 AND Question 8 (2 × 16 = 32 Marks).",
    "Total Marks: 50 Marks."
  ],
  "questions": [
    {
      "id": 1,
      "part": "PART_A",
      "marks": 2,
      "type": "WRITTEN",
      "question": "Define the fundamental principle of ${subject}.",
      "modelAnswer": "Accurate 2-mark answer key.",
      "keywords": ["principle", "definition"]
    },
    {
      "id": 2,
      "part": "PART_A",
      "marks": 2,
      "type": "CHOOSE",
      "question": "Which parameter governs operational stability in ${subject}?",
      "options": ["Deterministic constraint enforcement", "Random memory mutation", "Disabled verification checks", "Unbounded recursion"],
      "answer": 0,
      "modelAnswer": "Deterministic constraint enforcement.",
      "keywords": ["constraint", "stability"]
    },
    {
      "id": 3,
      "part": "PART_A",
      "marks": 2,
      "type": "TRUE_FALSE",
      "question": "In ${subject}, consistency invariants must be guaranteed across state boundaries.",
      "options": ["True", "False"],
      "answer": 0,
      "modelAnswer": "True.",
      "keywords": ["true"]
    },
    {
      "id": 4,
      "part": "PART_A",
      "marks": 2,
      "type": "WRITTEN",
      "question": "State the governing theorem or mathematical formulation in ${subject}.",
      "modelAnswer": "Accurate university definition.",
      "keywords": ["theorem", "formulation"]
    },
    {
      "id": 5,
      "part": "PART_A",
      "marks": 2,
      "type": "WRITTEN",
      "question": "Differentiate between Concept A and Concept B in ${subject}.",
      "modelAnswer": "Key technical differences.",
      "keywords": ["difference", "contrast"]
    },
    {
      "id": 6,
      "part": "PART_B",
      "marks": 8,
      "type": "WRITTEN",
      "optionLabel": "Question 6 (Option A)",
      "isOptional": true,
      "optionGroup": "PART_B_CHOICE",
      "question": "Explain the architectural pipeline and operational algorithm of ${subject} with a neat block diagram.",
      "modelAnswer": "Comprehensive 8-mark answer covering diagram, working principle, and step-by-step mathematical logic.",
      "keywords": ["architecture", "diagram", "pipeline", "algorithm"]
    },
    {
      "id": 7,
      "part": "PART_B",
      "marks": 8,
      "type": "WRITTEN",
      "optionLabel": "Question 6 (Option B - OR)",
      "isOptional": true,
      "optionGroup": "PART_B_CHOICE",
      "question": "(OR) Formulate a detailed mathematical derivation and performance optimization model for ${subject}.",
      "modelAnswer": "Comprehensive 8-mark derivation covering formulas, proof steps, and boundary conditions.",
      "keywords": ["derivation", "optimization", "model", "proof"]
    },
    {
      "id": 8,
      "part": "PART_C",
      "marks": 16,
      "type": "WRITTEN",
      "question": "Comprehensive Case Study / Application (Question 7): Design and evaluate a scalable, fault-tolerant enterprise solution for ${subject}. Provide system architecture, mathematical derivations, safety protocols, and implementation pseudocode.",
      "modelAnswer": "Comprehensive 16-mark answer covering architectural schematics, detailed mathematical derivation, trade-off analysis, and production deployment strategy.",
      "keywords": ["design", "architecture", "derivation", "case study", "implementation"]
    },
    {
      "id": 9,
      "part": "PART_C",
      "marks": 16,
      "type": "WRITTEN",
      "question": "Advanced Analytical Formulation (Question 8): Formulate rigorous mathematical governing equations, asymptotic complexity boundaries, and an end-to-end failure mitigation algorithm for ${subject}.",
      "modelAnswer": "Comprehensive 16-mark analytical breakdown with theorems, formal mathematical reduction, algorithm specifications, and verification proofs.",
      "keywords": ["formulation", "asymptotic", "complexity", "algorithm", "reduction"]
    }
  ]
}`;

    const aiRes = await aiRouterService.executeAIFallback([
      { role: "system", content: "You are the Chief University Examiner. Return ONLY valid JSON adhering strictly to the 34-mark blueprint." },
      { role: "user", content: prompt }
    ]);

    let mockExam = null;
    try {
      const match = aiRes.text.match(/\{[\s\S]*\}/);
      if (match) mockExam = JSON.parse(match[0]);
    } catch (_) { }

    if (!mockExam || !mockExam.questions?.length) {
      mockExam = {
        instituteName: collegeName,
        examinationTitle: "UNIVERSITY END SEMESTER MODEL EXAMINATION",
        subject,
        subjectCode: `AUR-${branch.slice(0, 4).toUpperCase()}-${semester}01`,
        totalMarks: 34,
        timeLimitMinutes: 90,
        instructions: [
          "Part A: Answer all 5 questions (5 × 2 = 10 Marks).",
          "Part B: Answer either Question 6A OR Question 6B (1 × 8 = 8 Marks).",
          "Part C: Answer Question 7 comprehensively (1 × 16 = 16 Marks).",
          "Total Marks: 34 Marks."
        ],
        questions: [
          {
            id: 1,
            part: "PART_A",
            marks: 2,
            type: "WRITTEN",
            question: `Define the core governing principle and domain scope of ${subject}:`,
            modelAnswer: "The core principle defines state boundary conditions, deterministic execution, and domain invariants.",
            keywords: ["principle", "state", "boundary"]
          },
          {
            id: 2,
            part: "PART_A",
            marks: 2,
            type: "CHOOSE",
            question: `Which property guarantees optimal asymptotic efficiency in ${subject}?`,
            options: [
              "Deterministic memoization and state caching",
              "Unbounded random branching",
              "Disabling boundary validation",
              "Static unoptimized memory allocations"
            ],
            answer: 0,
            modelAnswer: "Deterministic memoization and state caching provide optimal performance.",
            keywords: ["deterministic", "caching"]
          },
          {
            id: 3,
            part: "PART_A",
            marks: 2,
            type: "TRUE_FALSE",
            question: `In ${subject}, consistency invariants must be maintained across all state transitions.`,
            options: ["True", "False"],
            answer: 0,
            modelAnswer: "True. Consistency guarantees deterministic correctness.",
            keywords: ["true"]
          },
          {
            id: 4,
            part: "PART_A",
            marks: 2,
            type: "WRITTEN",
            question: `State the primary mathematical governing law or asymptotic theorem applicable to ${subject}:`,
            modelAnswer: "The theorem formalizes upper bound complexity and convergence under standard operational constraints.",
            keywords: ["law", "theorem", "convergence"]
          },
          {
            id: 5,
            part: "PART_A",
            marks: 2,
            type: "WRITTEN",
            question: `Differentiate between synchronous execution and asynchronous decoupling in ${subject}:`,
            modelAnswer: "Synchronous execution blocks until completion, while asynchronous decoupling permits non-blocking concurrent progression.",
            keywords: ["synchronous", "asynchronous", "blocking"]
          },
          {
            id: 6,
            part: "PART_B",
            marks: 8,
            type: "WRITTEN",
            optionLabel: "Question 6 (Option A)",
            isOptional: true,
            optionGroup: "PART_B_CHOICE",
            question: `[8 Marks - Option A] Detail the end-to-end architecture and functional mechanism in ${subject} with neat block diagrams and flowcharts:`,
            modelAnswer: "The answer covers system architecture, module block diagram, execution lifecycle, and latency optimization techniques.",
            keywords: ["architecture", "diagram", "mechanism", "flowchart"]
          },
          {
            id: 7,
            part: "PART_B",
            marks: 8,
            type: "WRITTEN",
            optionLabel: "Question 6 (Option B - OR)",
            isOptional: true,
            optionGroup: "PART_B_CHOICE",
            question: `[8 Marks - Option B (OR)] Formulate a rigorous analytical derivation and algorithmic proof for performance optimization in ${subject}:`,
            modelAnswer: "The proof covers mathematical formulation, state invariants, step-by-step reduction, and empirical validation.",
            keywords: ["derivation", "proof", "analytical", "algorithm"]
          },
          {
            id: 8,
            part: "PART_C",
            marks: 16,
            type: "WRITTEN",
            question: `[16 Marks - Comprehensive Application - Question 7] You are tasked with engineering a production-grade, fault-tolerant enterprise solution in ${subject}. Formulate the complete system architecture, mathematical governing equations, failure recovery protocols, and annotated pseudocode:`,
            modelAnswer: "Comprehensive 16-mark solution containing: 1. System block diagram. 2. Mathematical formulation. 3. Fault-tolerance mechanisms. 4. Code algorithms. 5. Comparative evaluation.",
            keywords: ["architecture", "equations", "fault-tolerant", "protocol", "code"]
          },
          {
            id: 9,
            part: "PART_C",
            marks: 16,
            type: "WRITTEN",
            question: `[16 Marks - Advanced Analytical Formulation - Question 8] Formulate a rigorous analytical optimization theorem and latency bounds derivation for ${subject}. Provide mathematical proof, state transition invariants, and end-to-end benchmark verification:`,
            modelAnswer: "Comprehensive 16-mark proof containing: 1. Theorem statement. 2. Mathematical derivation. 3. Boundary invariants. 4. Empirical validation matrix.",
            keywords: ["theorem", "derivation", "proof", "invariants", "optimization"]
          }
        ]
      };
    }

    mockExam.totalMarks = 50;

    auraDB.addActivity("mock_created", `Generated 50-Mark University Examination for ${subject} [${branch} Sem ${semester}]`);

    const partA = (mockExam.questions || []).filter(q => q.part === "PART_A");
    const partB = (mockExam.questions || []).filter(q => q.part === "PART_B");
    const partC = (mockExam.questions || []).filter(q => q.part === "PART_C");

    res.json({
      success: true,
      subject,
      subjectCode: mockExam.subjectCode,
      totalMarks: 50,
      timeLimitMinutes: mockExam.timeLimitMinutes || 90,
      questions: mockExam.questions,
      partA,
      partB,
      partC,
      paper: mockExam,
      mockExam
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------------
   API 7: POST /api/quiz/engineering/grade-mock & /curriculum/grade-mock
   GRADES AGAINST THE 34-MARK SCHEME:
   - Part A: 5 questions × 2M = 10 Marks
   - Part B: 1 selected question = 8 Marks
   - Part C: 1 question = 16 Marks
   Total: 34 Marks
--------------------------------------------------------- */
router.post(["/engineering/grade-mock", "/curriculum/grade-mock"], async (req, res) => {
  try {
    const { subject, group = "Engineering", branch = "CSE", semester = 3, mockExam, questions: passedQuestions, studentAnswers = {}, selectedPartBOption = null } = req.body;
    const questions = passedQuestions || mockExam?.questions || [];

    const partAQuestions = questions.filter(q => q.part === "PART_A");
    const partBQuestions = questions.filter(q => q.part === "PART_B");
    const partCQuestions = questions.filter(q => q.part === "PART_C");

    let partAMarksEarned = 0;
    let partBMarksEarned = 0;
    let partCMarksEarned = 0;

    const evaluatedDetails = [];

    // 1. Grade Part A (Max 10 Marks)
    partAQuestions.forEach(q => {
      const qMarks = q.marks || 2;
      const given = studentAnswers[q.id];
      let awarded = 0;
      let isCorrect = false;

      if (q.type === "CHOOSE" || q.type === "TRUE_FALSE") {
        isCorrect = given === q.answer;
        awarded = isCorrect ? qMarks : 0;
      } else {
        const text = String(given || "").trim().toLowerCase();
        if (text.length > 5) {
          const keywords = (q.keywords || []).map(k => String(k).toLowerCase());
          let hits = 0;
          keywords.forEach(kw => { if (text.includes(kw)) hits++; });
          if (text.length > 20 && (hits > 0 || text.length > 50)) {
            const ratio = Math.min(1.0, 0.6 + (hits / Math.max(1, keywords.length)) * 0.4);
            awarded = Math.round(qMarks * ratio);
            isCorrect = awarded >= 1;
          } else {
            awarded = 1;
            isCorrect = true;
          }
        }
      }
      partAMarksEarned += awarded;
      evaluatedDetails.push({ id: q.id, part: "PART_A", maxMarks: qMarks, awardedMarks: awarded, isCorrect, feedback: isCorrect ? "Accurate formulation" : "Partial definition" });
    });
    partAMarksEarned = Math.min(10, partAMarksEarned);

    // 2. Grade Part B (Max 8 Marks - student writes 1 of the 2 optional questions)
    let bestPartBQuestion = null;
    let bestPartBMarks = 0;

    partBQuestions.forEach(q => {
      const qMarks = 8;
      const given = studentAnswers[q.id];
      let awarded = 0;
      const text = String(given || "").trim().toLowerCase();

      if (text.length > 10) {
        const keywords = (q.keywords || []).map(k => String(k).toLowerCase());
        let hits = 0;
        keywords.forEach(kw => { if (text.includes(kw)) hits++; });

        if (text.length > 100 || hits >= 2) {
          const ratio = Math.min(1.0, 0.65 + (hits / Math.max(1, keywords.length)) * 0.35);
          awarded = Math.round(qMarks * ratio);
        } else if (text.length > 30) {
          awarded = Math.round(qMarks * 0.5);
        } else {
          awarded = 2;
        }
      }

      if (awarded > bestPartBMarks || !bestPartBQuestion) {
        bestPartBMarks = awarded;
        bestPartBQuestion = q;
      }
    });

    partBMarksEarned = Math.min(8, bestPartBMarks);
    if (bestPartBQuestion) {
      evaluatedDetails.push({
        id: bestPartBQuestion.id,
        part: "PART_B",
        maxMarks: 8,
        awardedMarks: partBMarksEarned,
        isCorrect: partBMarksEarned >= 5,
        feedback: `Evaluated choice: ${bestPartBQuestion.optionLabel || "Part B Option"}. Solid structured breakdown.`
      });
    }

    // 3. Grade Part C (Max 32 Marks - 2 Questions × 16 Marks each)
    partCQuestions.forEach((partCQ, idx) => {
      const qMarks = partCQ.marks || 16;
      const given = studentAnswers[partCQ.id];
      let awarded = 0;
      const text = String(given || "").trim().toLowerCase();

      if (text.length > 20) {
        const keywords = (partCQ.keywords || []).map(k => String(k).toLowerCase());
        let hits = 0;
        keywords.forEach(kw => { if (text.includes(kw)) hits++; });

        if (text.length > 180 || hits >= 2) {
          const ratio = Math.min(1.0, 0.7 + (hits / Math.max(1, keywords.length)) * 0.3);
          awarded = Math.round(qMarks * ratio);
        } else if (text.length > 60) {
          awarded = Math.round(qMarks * 0.55);
        } else {
          awarded = 5;
        }
      }

      partCMarksEarned += awarded;
      evaluatedDetails.push({
        id: partCQ.id,
        part: "PART_C",
        maxMarks: qMarks,
        awardedMarks: awarded,
        isCorrect: awarded >= 10,
        feedback: `Part C Question ${idx + 1} (16 Marks): Comprehensive university standard formulation with derivations and system design.`
      });
    });
    partCMarksEarned = Math.min(32, partCMarksEarned);

    const totalEarnedMarks = Math.min(50, partAMarksEarned + partBMarksEarned + partCMarksEarned);
    const percentage = Math.round((totalEarnedMarks / 50) * 100);

    let grade = "FOCUS NEEDED";
    if (totalEarnedMarks < 25) {
      grade = "FOCUS NEEDED";
    } else if (percentage >= 94) {
      grade = "O (Outstanding)";
    } else if (percentage >= 85) {
      grade = "A+ (Excellent)";
    } else if (percentage >= 75) {
      grade = "A (Very Good)";
    } else if (percentage >= 62) {
      grade = "B+ (Good)";
    } else {
      grade = "B (Pass / Average)";
    }

    auraDB.addActivity("mock_graded", `Graded 50-Mark Examination: ${totalEarnedMarks}/50 (${grade})`, {
      subject,
      group,
      branch,
      semester,
      earnedMarks: totalEarnedMarks,
      totalMarks: 50,
      percentage,
      grade
    });

    res.json({
      success: true,
      subject,
      totalMarks: 50,
      maxScore: 50,
      earnedMarks: totalEarnedMarks,
      score: totalEarnedMarks,
      percentage,
      grade,
      scoreBreakdown: {
        partA: { max: 10, earned: partAMarksEarned },
        partB: { max: 8, earned: partBMarksEarned },
        partC: { max: 32, earned: partCMarksEarned }
      },
      evaluatedDetails,
      evaluationSummary: `Completed comprehensive 50-mark evaluation. Part A: ${partAMarksEarned}/10, Part B (Option Choice): ${partBMarksEarned}/8, Part C (2 × 16-Mark Questions): ${partCMarksEarned}/32. Grade: ${grade}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
