/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, Customer, DailyCollectionRecord } from '../types/index.ts';

export const DEFAULT_SETTINGS: AppSettings = {
  orgName: 'श्री बन्धन बचत तथा ऋण सहकारी संस्था लि.',
  officeLocation: 'प्रधान कार्यालय : पोखरीया पर्सा',
  collectorName: 'Jauwad Hussain',
  currency: 'रु',
  language: 'hi',
  biometricEnabled: false, // Default is OFF: straight to Home screen
  pinEnabled: false,
  pin: '1234',
  autoLockMinutes: 5,
  showDevanagariNames: true,
  supabase: {
    url: 'https://allfgtrlriqpzywovlsg.supabase.co',
    anonKey: 'sb_publishable_Q8jVG6-AM-sWAJ3RuR_qSQ_tMIvtSRs',
    autoSync: true,
  },
};

// 85 customers pre-seeded; 1-41 faithfully digitized from the user's paper sheet
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    "id": "c1",
    "sn": 1,
    "name": "TAJBUN NESA KHATUN",
    "nameDevanagari": "तजबुन नेसा खातुन",
    "accountNumber": "129001526",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c2",
    "sn": 2,
    "name": "SUSHITA KUMARI",
    "nameDevanagari": "सुशिता कुमारी",
    "accountNumber": "129001726",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c3",
    "sn": 3,
    "name": "SEKHA ERFAN",
    "nameDevanagari": "शेख इरफान",
    "accountNumber": "129001362",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c4",
    "sn": 4,
    "name": "NAJMUDINA BABU THAKURAI",
    "nameDevanagari": "नजमुदिना बाबु ठकुराई",
    "accountNumber": "129000791",
    "phone": "",
    "note": "1851",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c5",
    "sn": 5,
    "name": "HABIBULLAH DEVWAN FAKIR",
    "nameDevanagari": "हबिबुल्लाह देववान फकिर",
    "accountNumber": "129001599",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c6",
    "sn": 6,
    "name": "SARDA DEVISAH HALWAI",
    "nameDevanagari": "सारदा देवि साह हलुवाई",
    "accountNumber": "129001525",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c7",
    "sn": 7,
    "name": "BEELKIS FATHAMA",
    "nameDevanagari": "बिल्किस फातिमा",
    "accountNumber": "129001782",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c8",
    "sn": 8,
    "name": "LALMUN KHATUN",
    "nameDevanagari": "लालमुन खातुन",
    "accountNumber": "129001494",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c9",
    "sn": 9,
    "name": "SALMA KHATUN",
    "nameDevanagari": "सलमा खातुन",
    "accountNumber": "129000677",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c10",
    "sn": 10,
    "name": "SAHINA KHATUN",
    "nameDevanagari": "साहिना खातुन",
    "accountNumber": "129001578",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c11",
    "sn": 11,
    "name": "SAHINA KHATUN",
    "nameDevanagari": "साहिना खातुन",
    "accountNumber": "129000806",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c12",
    "sn": 12,
    "name": "RUKHSANA KHATUN",
    "nameDevanagari": "रुखसाना खातुन",
    "accountNumber": "129001105",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c13",
    "sn": 13,
    "name": "KHALIL SEKH",
    "nameDevanagari": "खलिल शेख",
    "accountNumber": "129001019",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c14",
    "sn": 14,
    "name": "AMNA KHATUN",
    "nameDevanagari": "अमना खातुन",
    "accountNumber": "129001169",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c15",
    "sn": 15,
    "name": "AFTAB AALAM",
    "nameDevanagari": "आफताब आलम",
    "accountNumber": "129000524",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c16",
    "sn": 16,
    "name": "MAHMD AFGAAN SEKH",
    "nameDevanagari": "महम्मद अफगान शेख",
    "accountNumber": "129001401",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c17",
    "sn": 17,
    "name": "AMITAB RAUT",
    "nameDevanagari": "अमिताभ राउत",
    "accountNumber": "129001502",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c18",
    "sn": 18,
    "name": "TABREJ AALAM HAJAM",
    "nameDevanagari": "तबरेज आलम हजाम",
    "accountNumber": "129000626",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c19",
    "sn": 19,
    "name": "AAS MAHMD ANSARI",
    "nameDevanagari": "आस महम्मद अंसारी",
    "accountNumber": "129001092",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c20",
    "sn": 20,
    "name": "HAMID MIYA",
    "nameDevanagari": "हामिद मिया",
    "accountNumber": "129000996",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c21",
    "sn": 21,
    "name": "MUKHTAR ANSARI",
    "nameDevanagari": "मुख्तार अंसारी",
    "accountNumber": "129001040",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c22",
    "sn": 22,
    "name": "MUSLIM MIYA TELI",
    "nameDevanagari": "मुस्लिम मिया तेली",
    "accountNumber": "129001670",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c23",
    "sn": 23,
    "name": "MAIRUL NESHA KHATUN",
    "nameDevanagari": "मैरुल नेशा खातुन",
    "accountNumber": "129001589",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c24",
    "sn": 24,
    "name": "TAAJMA KHATUN",
    "nameDevanagari": "ताजमा खातुन",
    "accountNumber": "129001669",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c25",
    "sn": 25,
    "name": "RUKHSANA KHATUN",
    "nameDevanagari": "रुखसाना खातुन",
    "accountNumber": "129000306",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c26",
    "sn": 26,
    "name": "BINA DEVI",
    "nameDevanagari": "बिना देवी",
    "accountNumber": "129001531",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c27",
    "sn": 27,
    "name": "JAGDISH SAHNI",
    "nameDevanagari": "जगदीश सहनी",
    "accountNumber": "129001654",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c28",
    "sn": 28,
    "name": "FIROJ MIYA",
    "nameDevanagari": "फिरोज मिया",
    "accountNumber": "129001060",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c29",
    "sn": 29,
    "name": "SHIV PUJAN KUMAR PANDIT",
    "nameDevanagari": "शिव पुजन कुमार पण्डित",
    "accountNumber": "129001588",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c30",
    "sn": 30,
    "name": "GULSAN KHATUN",
    "nameDevanagari": "गुलशन खातुन",
    "accountNumber": "129001564",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c31",
    "sn": 31,
    "name": "JAHIR DEVAN",
    "nameDevanagari": "जाहिर देवान",
    "accountNumber": "129001680",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c32",
    "sn": 32,
    "name": "NAAJMA KHATUN",
    "nameDevanagari": "नाजमा खातुन",
    "accountNumber": "129001603",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c33",
    "sn": 33,
    "name": "RAJIYA THAKURAI",
    "nameDevanagari": "रजिया ठकुराई",
    "accountNumber": "129001668",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c34",
    "sn": 34,
    "name": "ROSHAN KHATUN",
    "nameDevanagari": "रोशन खातुन",
    "accountNumber": "129001138",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c35",
    "sn": 35,
    "name": "AAISA KHATUN",
    "nameDevanagari": "आइशा खातुन",
    "accountNumber": "129000868",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c36",
    "sn": 36,
    "name": "NURJAHA KHATUN",
    "nameDevanagari": "नुरजहाँ खातुन",
    "accountNumber": "129001369",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c37",
    "sn": 37,
    "name": "SAFIK MIYA THAKURAI",
    "nameDevanagari": "सफिक मिया ठकुराई",
    "accountNumber": "129001012",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c38",
    "sn": 38,
    "name": "NAAJMA KHATUN",
    "nameDevanagari": "नाजमा खातुन",
    "accountNumber": "129000930",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c39",
    "sn": 39,
    "name": "SOYABA KHATUN",
    "nameDevanagari": "सोयबा खातुन",
    "accountNumber": "129000745",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c40",
    "sn": 40,
    "name": "FULTARA KHATUN",
    "nameDevanagari": "फुल्तारा खातुन",
    "accountNumber": "129000822",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c41",
    "sn": 41,
    "name": "BIKASH PAASWAN",
    "nameDevanagari": "बिकाश पासवान",
    "accountNumber": "129001222",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c42",
    "sn": 42,
    "name": "SAGINA KHATUN",
    "nameDevanagari": "सगीना खातुन",
    "accountNumber": "129000946",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c43",
    "sn": 43,
    "name": "TAJ MAHAMAD THAKURAI",
    "nameDevanagari": "ताज महम्मद ठकुराई",
    "accountNumber": "129001767",
    "phone": "",
    "note": "300",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c44",
    "sn": 44,
    "name": "KALMA KHATUN",
    "nameDevanagari": "कलमा खातुन",
    "accountNumber": "129001617",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c45",
    "sn": 45,
    "name": "ISRAT JAAHA",
    "nameDevanagari": "इसरत जहा",
    "accountNumber": "129001330",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c46",
    "sn": 46,
    "name": "MAHMAD KAASIM",
    "nameDevanagari": "महम्मद कासिम",
    "accountNumber": "129001390",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c47",
    "sn": 47,
    "name": "SABANA KHATUN",
    "nameDevanagari": "सबाना खातुन",
    "accountNumber": "129001470",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c48",
    "sn": 48,
    "name": "AJAY DAS TATWA",
    "nameDevanagari": "अजय दास तत्व",
    "accountNumber": "129001435",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c49",
    "sn": 49,
    "name": "RAJIYA KHATUN",
    "nameDevanagari": "रजिया खातुन",
    "accountNumber": "129001163",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c50",
    "sn": 50,
    "name": "RANBIJAY SINGH",
    "nameDevanagari": "रणविजय सिंह",
    "accountNumber": "129001162",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c51",
    "sn": 51,
    "name": "RUKSHANA KHATUN",
    "nameDevanagari": "रुखसाना खातुन",
    "accountNumber": "129001168",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c52",
    "sn": 52,
    "name": "KHURSED AALAM DEWAN",
    "nameDevanagari": "खुर्सेद आलम देवान",
    "accountNumber": "129001400",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c53",
    "sn": 53,
    "name": "PANALAL SAH KANU",
    "nameDevanagari": "पन्नालाल साह कानु",
    "accountNumber": "129001489",
    "phone": "",
    "note": "500",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c54",
    "sn": 54,
    "name": "GULSAN KHATUN",
    "nameDevanagari": "गुलसन खातुन",
    "accountNumber": "129001619",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c55",
    "sn": 55,
    "name": "RUBI KHATUN",
    "nameDevanagari": "रुबी खातुन",
    "accountNumber": "129000842",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c56",
    "sn": 56,
    "name": "SOHANA KHATUN",
    "nameDevanagari": "सोहाना खातुन",
    "accountNumber": "129001444",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c57",
    "sn": 57,
    "name": "MAHAMAD AAJAD SEKH",
    "nameDevanagari": "महम्मद आजाद शेख",
    "accountNumber": "129001445",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c58",
    "sn": 58,
    "name": "MARIYAM KHATUN",
    "nameDevanagari": "मरियम खातुन",
    "accountNumber": "129001303",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c59",
    "sn": 59,
    "name": "AASMA SEKHIN",
    "nameDevanagari": "आसमा शेखिन",
    "accountNumber": "129001332",
    "phone": "",
    "note": "500",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c60",
    "sn": 60,
    "name": "JAKIR HUSSAIN ANASARI",
    "nameDevanagari": "जाकिर हुसेन अन्सारी",
    "accountNumber": "129001259",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c61",
    "sn": 61,
    "name": "SABILA KHATUN",
    "nameDevanagari": "सबिला खातुन",
    "accountNumber": "129001631",
    "phone": "",
    "note": "200",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c62",
    "sn": 62,
    "name": "SAHIDA KHATUN",
    "nameDevanagari": "सहिदा खातुन",
    "accountNumber": "129001519",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c63",
    "sn": 63,
    "name": "SAHIDA MIYA CHURIHAR",
    "nameDevanagari": "सहिदा मिया चुरिहार",
    "accountNumber": "129000920",
    "phone": "",
    "note": "200",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c64",
    "sn": 64,
    "name": "CHANDAN HAJARA",
    "nameDevanagari": "चन्दन हजरा",
    "accountNumber": "129000482",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c65",
    "sn": 65,
    "name": "DURGA KUMARI AACHAJU",
    "nameDevanagari": "दुर्गा कुमारी आछाजु",
    "accountNumber": "129001507",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c66",
    "sn": 66,
    "name": "RANJAN KUMARI JAISWAL",
    "nameDevanagari": "रन्जन कुमारी जैसवाल",
    "accountNumber": "129001278",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c67",
    "sn": 67,
    "name": "SADAM HUSEN",
    "nameDevanagari": "सदाम हुसेन",
    "accountNumber": "129001302",
    "phone": "",
    "note": "200",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c68",
    "sn": 68,
    "name": "MAHAMAD AAEMAN THAKURAI",
    "nameDevanagari": "महम्मद ऐमान ठकुराई",
    "accountNumber": "129001359",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c69",
    "sn": 69,
    "name": "SITA DEVI",
    "nameDevanagari": "सीता देवी",
    "accountNumber": "129001171",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c70",
    "sn": 70,
    "name": "HIRDENARAYAN PARSAD YADAV",
    "nameDevanagari": "हृदयनारायण प्रसाद यादव",
    "accountNumber": "129001479",
    "phone": "",
    "note": "300",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c71",
    "sn": 71,
    "name": "BUDHAN HAJARA",
    "nameDevanagari": "बुधन हजरा",
    "accountNumber": "129001590",
    "phone": "",
    "note": "200",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c72",
    "sn": 72,
    "name": "SONALAL PD KURMI",
    "nameDevanagari": "सोनालाल प्र. कुर्मी",
    "accountNumber": "129000816",
    "phone": "",
    "note": "500",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c73",
    "sn": 73,
    "name": "SUNAINA DEVI",
    "nameDevanagari": "सुनैना देवी",
    "accountNumber": "129000344",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c74",
    "sn": 74,
    "name": "NAJNI KHATUN",
    "nameDevanagari": "नज्नी खातुन",
    "accountNumber": "129001412",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c75",
    "sn": 75,
    "name": "MIRA DEVI",
    "nameDevanagari": "मीरा देवी",
    "accountNumber": "129001211",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c76",
    "sn": 76,
    "name": "BEELKIS FATHAMA",
    "nameDevanagari": "बिल्किस फातिमा",
    "accountNumber": "129000208",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c77",
    "sn": 77,
    "name": "ROHIT KUMAR MAHATO",
    "nameDevanagari": "रोहित कुमार महतो",
    "accountNumber": "129000951",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c78",
    "sn": 78,
    "name": "MUNI DEVI",
    "nameDevanagari": "मुनी देवी",
    "accountNumber": "129001415",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c79",
    "sn": 79,
    "name": "MAHMD GYASUMIYA TELI",
    "nameDevanagari": "महम्मद ग्यासुमिया तेली",
    "accountNumber": "129001781",
    "phone": "",
    "note": "1500",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c80",
    "sn": 80,
    "name": "SOYABA KHATOON",
    "nameDevanagari": "सोयाबा खातुन",
    "accountNumber": "129000758",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c81",
    "sn": 81,
    "name": "RAMESH PRASAD SAH",
    "nameDevanagari": "रमेश प्रसाद साह",
    "accountNumber": "129001032",
    "phone": "",
    "note": "500",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c82",
    "sn": 82,
    "name": "HIRALAL SAH SONAR",
    "nameDevanagari": "हिरालाल साह सोनार",
    "accountNumber": "129001284",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c83",
    "sn": 83,
    "name": "RAMESH LAMA",
    "nameDevanagari": "रमेश लामा",
    "accountNumber": "129001108",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c84",
    "sn": 84,
    "name": "UMESH LAMA",
    "nameDevanagari": "उमेश लामा",
    "accountNumber": "129001135",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c85",
    "sn": 85,
    "name": "SEKH WAJUL HAQUE",
    "nameDevanagari": "शेख वजुल हक",
    "accountNumber": "129000464",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c86",
    "sn": 86,
    "name": "NURSAMA KHATUN",
    "nameDevanagari": "नुरसमा खातुन",
    "accountNumber": "129001386",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c87",
    "sn": 87,
    "name": "RUKSANA KHATUN",
    "nameDevanagari": "रुखसाना खातुन",
    "accountNumber": "129001420",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c88",
    "sn": 88,
    "name": "RAMESH SARRAF",
    "nameDevanagari": "रमेश सर्राफ",
    "accountNumber": "129001088",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c89",
    "sn": 89,
    "name": "PREAMSILA DEVI",
    "nameDevanagari": "प्रेमशिला देवी",
    "accountNumber": "129000955",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c90",
    "sn": 90,
    "name": "MADHU PALI",
    "nameDevanagari": "मधु पाली",
    "accountNumber": "1874",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c91",
    "sn": 91,
    "name": "SAKINA KHATUN",
    "nameDevanagari": "सकीना खातुन",
    "accountNumber": "129000705",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c92",
    "sn": 92,
    "name": "HEMANT SARAFF",
    "nameDevanagari": "हेमन्त सराफ",
    "accountNumber": "129000772",
    "phone": "",
    "note": "1805",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c93",
    "sn": 93,
    "name": "PUNAM DEVI",
    "nameDevanagari": "पूनम देवी",
    "accountNumber": "129001194",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c94",
    "sn": 94,
    "name": "MANISH KUMAR GUPTA",
    "nameDevanagari": "मनिष कुमार गुप्ता",
    "accountNumber": "129001299",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c95",
    "sn": 95,
    "name": "ABAAS ANSARI",
    "nameDevanagari": "अब्बास अन्सारी",
    "accountNumber": "129001557",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c96",
    "sn": 96,
    "name": "ROKAYDA KHATUN",
    "nameDevanagari": "रोकायदा खातुन",
    "accountNumber": "129001707",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c97",
    "sn": 97,
    "name": "JAISUL NESHA",
    "nameDevanagari": "जैसुल नेशा",
    "accountNumber": "129001548",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c98",
    "sn": 98,
    "name": "SILA DEVI",
    "nameDevanagari": "शीला देवी",
    "accountNumber": "129001393",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c99",
    "sn": 99,
    "name": "TAYERA KHATUN",
    "nameDevanagari": "तयेरा खातुन",
    "accountNumber": "129001584",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c100",
    "sn": 100,
    "name": "SAMIM AKHATAR",
    "nameDevanagari": "समिम अख्तर",
    "accountNumber": "129001167",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c101",
    "sn": 101,
    "name": "TARA DEVI",
    "nameDevanagari": "तारा देवी",
    "accountNumber": "129000603",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c102",
    "sn": 102,
    "name": "MUNNI DEVI",
    "nameDevanagari": "मुन्नी देवी",
    "accountNumber": "129001563",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c103",
    "sn": 103,
    "name": "SANTOSH MAHATO PAASI",
    "nameDevanagari": "सन्तोष महतो पासी",
    "accountNumber": "129000739",
    "phone": "",
    "note": "1806",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c104",
    "sn": 104,
    "name": "ARBIND CHAURASHIYA",
    "nameDevanagari": "अरविन्द चौरसिया",
    "accountNumber": "129001683",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c105",
    "sn": 105,
    "name": "MANOJ KUMAR RAUT",
    "nameDevanagari": "मनोज कुमार राउत",
    "accountNumber": "129001697",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c106",
    "sn": 106,
    "name": "GANESH PAASI",
    "nameDevanagari": "गणेश पासी",
    "accountNumber": "129000903",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c107",
    "sn": 107,
    "name": "MANOJ KUMAR",
    "nameDevanagari": "मनोज कुमार",
    "accountNumber": "1290001061",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c108",
    "sn": 108,
    "name": "SIMA KHATUN",
    "nameDevanagari": "सीमा खातुन",
    "accountNumber": "129001685",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c109",
    "sn": 109,
    "name": "AAJAD HUSSAIN",
    "nameDevanagari": "आजाद हुसैन",
    "accountNumber": "129001380",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c110",
    "sn": 110,
    "name": "DHIRAJ KUMAR BARNWAL",
    "nameDevanagari": "धिरज कुमार वर्णवाल",
    "accountNumber": "129000888",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c111",
    "sn": 111,
    "name": "MAHMD SABIR",
    "nameDevanagari": "महम्द साबिर",
    "accountNumber": "129001471",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c112",
    "sn": 112,
    "name": "TARA DEVI",
    "nameDevanagari": "तारा देवी",
    "accountNumber": "129001547",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c113",
    "sn": 113,
    "name": "HINA DEVI",
    "nameDevanagari": "हिना देवी",
    "accountNumber": "129001503",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c114",
    "sn": 114,
    "name": "SIKENDRA PRASAD JAISWAL",
    "nameDevanagari": "सिकेन्द्र प्रसाद जैसवाल",
    "accountNumber": "129001182",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c115",
    "sn": 115,
    "name": "RAJESH BAHADUR SHRESTHA",
    "nameDevanagari": "राजेश बहादुर श्रेष्ठ",
    "accountNumber": "129000926",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c116",
    "sn": 116,
    "name": "SHEKH ASRAF",
    "nameDevanagari": "शेख अशरफ",
    "accountNumber": "129001480",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c117",
    "sn": 117,
    "name": "BRIJESH KUMAR",
    "nameDevanagari": "ब्रिजेश कुमार",
    "accountNumber": "129001693",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c118",
    "sn": 118,
    "name": "KRISHNA KUMAR MAHATO",
    "nameDevanagari": "कृष्ण कुमार महतो",
    "accountNumber": "129000864",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c119",
    "sn": 119,
    "name": "MAHMD MUMTAJ KHAN",
    "nameDevanagari": "महम्द मुम्ताज खान",
    "accountNumber": "129001601",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c120",
    "sn": 120,
    "name": "DINESH RAUT KURMI",
    "nameDevanagari": "दिनेश राउत कुर्मी",
    "accountNumber": "129001233",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c121",
    "sn": 121,
    "name": "MUKESH PRASAD KURMI",
    "nameDevanagari": "मुकेश प्रसाद कुर्मी",
    "accountNumber": "129001090",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c122",
    "sn": 122,
    "name": "PRAMOD KUMAR SAH",
    "nameDevanagari": "प्रमोद कुमार साह",
    "accountNumber": "129001558",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c123",
    "sn": 123,
    "name": "SAAHEB AALAM SEKH",
    "nameDevanagari": "साहेब आलम शेख",
    "accountNumber": "106012793",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c124",
    "sn": 124,
    "name": "ARUN KUMAR YADAV",
    "nameDevanagari": "अरुण कुमार यादव",
    "accountNumber": "106012815",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c125",
    "sn": 125,
    "name": "PINKI DEVI",
    "nameDevanagari": "पिंकी देवी",
    "accountNumber": "129000965",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c126",
    "sn": 126,
    "name": "ANITA KUMARI",
    "nameDevanagari": "अनिता कुमारी",
    "accountNumber": "129001101",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c127",
    "sn": 127,
    "name": "MAHMAD SAMIR ANSARI",
    "nameDevanagari": "महम्मद समिर अन्सारी",
    "accountNumber": "129001346",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c128",
    "sn": 128,
    "name": "AMAR KUMAR BARNAWAL",
    "nameDevanagari": "अमर कुमार वर्णवाल",
    "accountNumber": "129000904",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c129",
    "sn": 129,
    "name": "DINESH RAUT MESTAR",
    "nameDevanagari": "दिनेश राउत मेस्तर",
    "accountNumber": "129000905",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c130",
    "sn": 130,
    "name": "SATISH RAUT",
    "nameDevanagari": "सतिश राउत",
    "accountNumber": "129000900",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c131",
    "sn": 131,
    "name": "MAHMAD TARIK MIYA",
    "nameDevanagari": "महम्मद तारिक मिया",
    "accountNumber": "129001521",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c132",
    "sn": 132,
    "name": "BAGDAD MIYA THAKURAI",
    "nameDevanagari": "बगदाद मिया ठकुराई",
    "accountNumber": "129000789",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c133",
    "sn": 133,
    "name": "NURJAHA KHATUN",
    "nameDevanagari": "नुरजहाँ खातुन",
    "accountNumber": "129000668",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c134",
    "sn": 134,
    "name": "JARINA KHATUN",
    "nameDevanagari": "जरीना खातुन",
    "accountNumber": "129001656",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c135",
    "sn": 135,
    "name": "BADRI PAASWAN",
    "nameDevanagari": "बद्री पासवान",
    "accountNumber": "129000923",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c136",
    "sn": 136,
    "name": "CHHOTU PAASWAN",
    "nameDevanagari": "छोटु पासवान",
    "accountNumber": "129000932",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c137",
    "sn": 137,
    "name": "SAMIR ALI",
    "nameDevanagari": "समिर अली",
    "accountNumber": "129001591",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c138",
    "sn": 138,
    "name": "SABRUN KHATUN",
    "nameDevanagari": "सबरुन खातुन",
    "accountNumber": "129001579",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c139",
    "sn": 139,
    "name": "KARUNA DEVI SHAH KANU",
    "nameDevanagari": "करुणा देवी शाह कानु",
    "accountNumber": "1164",
    "phone": "",
    "note": "Handwritten entry at bottom",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c140",
    "sn": 140,
    "name": "SAMIR MIYA DHUNIYA",
    "nameDevanagari": "समिर मिया धुनिया",
    "accountNumber": "1832",
    "phone": "",
    "note": "Handwritten entry at bottom",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c141",
    "sn": 141,
    "name": "AMIN DEWAN",
    "nameDevanagari": "अमिन देवान",
    "accountNumber": "129000857",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c142",
    "sn": 142,
    "name": "MAHMD TAHIR",
    "nameDevanagari": "महम्द ताहिर",
    "accountNumber": "129001542",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c143",
    "sn": 143,
    "name": "ASLAM MIIYA CHURIHAAR",
    "nameDevanagari": "अस्लम मियाँ चुरिहार",
    "accountNumber": "129001381",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c144",
    "sn": 144,
    "name": "TANUJA BEGAM",
    "nameDevanagari": "तनुजा बेगम",
    "accountNumber": "129001536",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c145",
    "sn": 145,
    "name": "SAHAJAHA KHATUN",
    "nameDevanagari": "सहजहाँ खातुन",
    "accountNumber": "129000188",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c146",
    "sn": 146,
    "name": "SAKILA KHATUN",
    "nameDevanagari": "सकिला खातुन",
    "accountNumber": "129000678",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c147",
    "sn": 147,
    "name": "JUBEDA KHATUN",
    "nameDevanagari": "जुबेदा खातुन",
    "accountNumber": "129000679",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c148",
    "sn": 148,
    "name": "GYASU MIYA ANSARI",
    "nameDevanagari": "ग्यासु मियाँ अन्सारी",
    "accountNumber": "129001427",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c149",
    "sn": 149,
    "name": "MAHMD MUMTAJ KHAN",
    "nameDevanagari": "महम्द मुम्ताज खान",
    "accountNumber": "129000949",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c150",
    "sn": 150,
    "name": "AARTI KUMARI MANDAL",
    "nameDevanagari": "आरती कुमारी मण्डल",
    "accountNumber": "129001497",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c151",
    "sn": 151,
    "name": "GOKUL KUMAR GELAL",
    "nameDevanagari": "गोकुल कुमार गेलाल",
    "accountNumber": "129001640",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c152",
    "sn": 152,
    "name": "JITENDRA KUMAR",
    "nameDevanagari": "जितेन्द्र कुमार",
    "accountNumber": "129001498",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c153",
    "sn": 153,
    "name": "IMTIYAJ MIYA ANSARI",
    "nameDevanagari": "इम्तियाज मियाँ अन्सारी",
    "accountNumber": "129001417",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c154",
    "sn": 154,
    "name": "JASMIN KHATUN",
    "nameDevanagari": "जास्मिन खातुन",
    "accountNumber": "129001687",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c155",
    "sn": 155,
    "name": "ROKSHANA KHATUN",
    "nameDevanagari": "रोकशाना खातुन",
    "accountNumber": "129001411",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c156",
    "sn": 156,
    "name": "KISMAT MIYA TELI",
    "nameDevanagari": "किस्मत मियाँ तेली",
    "accountNumber": "129001506",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c157",
    "sn": 157,
    "name": "ABDUL AJIM ANSARI",
    "nameDevanagari": "अब्दुल अजिम अन्सारी",
    "accountNumber": "129001705",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c158",
    "sn": 158,
    "name": "RAMESH SARAFF",
    "nameDevanagari": "रमेश सराफ",
    "accountNumber": "129000265",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c159",
    "sn": 159,
    "name": "JAINAB KHATUN",
    "nameDevanagari": "जैनब खातुन",
    "accountNumber": "129001027",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c160",
    "sn": 160,
    "name": "PUNAM DEVI MESTRIN",
    "nameDevanagari": "पूनम देवी मेस्त्रीन",
    "accountNumber": "129001509",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c161",
    "sn": 161,
    "name": "ABDUL KALAM",
    "nameDevanagari": "अब्दुल कलाम",
    "accountNumber": "129000897",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c162",
    "sn": 162,
    "name": "NABIJAN DEWAN",
    "nameDevanagari": "नबिजान देवान",
    "accountNumber": "129001580",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c163",
    "sn": 163,
    "name": "PRITI KUMARI",
    "nameDevanagari": "प्रीति कुमारी",
    "accountNumber": "129001778",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c164",
    "sn": 164,
    "name": "TAMMANA KHATUN",
    "nameDevanagari": "तम्मना खातुन",
    "accountNumber": "129001766",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c165",
    "sn": 165,
    "name": "AASMA KHATUN",
    "nameDevanagari": "आसमा खातुन",
    "accountNumber": "129001332",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c166",
    "sn": 166,
    "name": "KAMRUJMA MANSURI",
    "nameDevanagari": "कमरुज्मा मन्सुरी",
    "accountNumber": "129001066",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c167",
    "sn": 167,
    "name": "SAFRODIN MIYA DARJI",
    "nameDevanagari": "सफ्रोदिन मियाँ दर्जी",
    "accountNumber": "129000135",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c168",
    "sn": 168,
    "name": "ASHA DEVI",
    "nameDevanagari": "आशा देवी",
    "accountNumber": "129001639",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c169",
    "sn": 169,
    "name": "JINAT NESA",
    "nameDevanagari": "जिनत नेसा",
    "accountNumber": "129000778",
    "phone": "",
    "note": "1838",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c170",
    "sn": 170,
    "name": "CHATU MIYA",
    "nameDevanagari": "चतु मियाँ",
    "accountNumber": "129000651",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c171",
    "sn": 171,
    "name": "GYASU MIYA ANSARI",
    "nameDevanagari": "ग्यासु मियाँ अन्सारी",
    "accountNumber": "129000661",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c172",
    "sn": 172,
    "name": "SUSHIL KUMAR YADAV",
    "nameDevanagari": "सुशिल कुमार यादव",
    "accountNumber": "129000397",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c173",
    "sn": 173,
    "name": "ROKAIDA KHATUN",
    "nameDevanagari": "रोकैदा खातुन",
    "accountNumber": "129001236",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c174",
    "sn": 174,
    "name": "SUNITA KUMARI",
    "nameDevanagari": "सुनिता कुमारी",
    "accountNumber": "129001783",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c175",
    "sn": 175,
    "name": "SAHID MIYA SAMANI",
    "nameDevanagari": "साहिद मियाँ समानी",
    "accountNumber": "129001723",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c176",
    "sn": 176,
    "name": "ARBAJ HAWARI",
    "nameDevanagari": "अरबाज हवारी",
    "accountNumber": "129000712",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c177",
    "sn": 177,
    "name": "SUSHITA KUMARI",
    "nameDevanagari": "सुशिता कुमारी",
    "accountNumber": "129000713",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c178",
    "sn": 178,
    "name": "GUFRANA KHATUN",
    "nameDevanagari": "गुफराना खातुन",
    "accountNumber": "129000625",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c179",
    "sn": 179,
    "name": "MAHMAD ARMAN ANSARI",
    "nameDevanagari": "महम्मद अरमान अन्सारी",
    "accountNumber": "129000248",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c180",
    "sn": 180,
    "name": "MURAD HUSAIN",
    "nameDevanagari": "मुराद हुसेन",
    "accountNumber": "129001481",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c181",
    "sn": 181,
    "name": "RAJIYA THAKURAI",
    "nameDevanagari": "रजिया ठकुराई",
    "accountNumber": "129000632",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c182",
    "sn": 182,
    "name": "MUNA SAH",
    "nameDevanagari": "मुना साह",
    "accountNumber": "129001735",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c183",
    "sn": 183,
    "name": "LALO KHATUN",
    "nameDevanagari": "लालो खातुन",
    "accountNumber": "129000716",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c184",
    "sn": 184,
    "name": "RAMCHANDRA MAHATO",
    "nameDevanagari": "रामचन्द्र महतो",
    "accountNumber": "129000721",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c185",
    "sn": 185,
    "name": "BINTA KUMARI",
    "nameDevanagari": "बिन्ता कुमारी",
    "accountNumber": "129001740",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c186",
    "sn": 186,
    "name": "KRISH PATEL",
    "nameDevanagari": "क्रिश पटेल",
    "accountNumber": "129001786",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c187",
    "sn": 187,
    "name": "NIRMALA DEVI",
    "nameDevanagari": "निर्मला देवी",
    "accountNumber": "129001787",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c188",
    "sn": 188,
    "name": "TAIYAB MIYA DHARJI",
    "nameDevanagari": "तैयब मियाँ धारजी",
    "accountNumber": "129001738",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c189",
    "sn": 189,
    "name": "ABAAS ANSARI",
    "nameDevanagari": "अब्बास अंसारी",
    "accountNumber": "129001676",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c190",
    "sn": 190,
    "name": "REMUNA NISA KHATUN",
    "nameDevanagari": "रेमुना निसा खातून",
    "accountNumber": "129000733",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c191",
    "sn": 191,
    "name": "RAHIMA KHATUN",
    "nameDevanagari": "रहिमा खातून",
    "accountNumber": "129000314",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c192",
    "sn": 192,
    "name": "MAHMD TABREJ ANSARI",
    "nameDevanagari": "मोहम्मद तबरेज अंसारी",
    "accountNumber": "129000738",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c193",
    "sn": 193,
    "name": "JAKIR HUSAIN",
    "nameDevanagari": "जाकिर हुसेन",
    "accountNumber": "129000414",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c194",
    "sn": 194,
    "name": "SANJAY PASWAN",
    "nameDevanagari": "संजय पासवान",
    "accountNumber": "129000759",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c195",
    "sn": 195,
    "name": "BAIJU PRASAD SAH",
    "nameDevanagari": "बैजु प्रसाद साह",
    "accountNumber": "129000760",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c196",
    "sn": 196,
    "name": "MAHMD GYASUMIYA TELI",
    "nameDevanagari": "मोहम्मद ग्यासुमिया तेली",
    "accountNumber": "129000757",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c197",
    "sn": 197,
    "name": "KRISHNA SAH SONAR",
    "nameDevanagari": "कृष्णा साह सोनार",
    "accountNumber": "129000391",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c198",
    "sn": 198,
    "name": "SABNAM KHATUN",
    "nameDevanagari": "सबनम खातून",
    "accountNumber": "129001716",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c199",
    "sn": 199,
    "name": "MADHU PAASI",
    "nameDevanagari": "मधु पासी",
    "accountNumber": "129001363",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c200",
    "sn": 200,
    "name": "MOHAMAD ESMAIL MANSURI",
    "nameDevanagari": "मोहम्मद इस्माइल मन्सूरी",
    "accountNumber": "129001644",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c201",
    "sn": 201,
    "name": "RAM BABU MAHRA",
    "nameDevanagari": "राम बाबु महरा",
    "accountNumber": "129000763",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c202",
    "sn": 202,
    "name": "MAHAMD INTAAF SAMANI",
    "nameDevanagari": "मोहम्मद इन्ताफ समानी",
    "accountNumber": "129000769",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c203",
    "sn": 203,
    "name": "ASHRAF HAWARI",
    "nameDevanagari": "अशरफ हवारी",
    "accountNumber": "129001327",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c204",
    "sn": 204,
    "name": "REJINDRA NEPALI",
    "nameDevanagari": "रेजिन्द्र नेपाली",
    "accountNumber": "129001326",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c205",
    "sn": 205,
    "name": "NAJRUN KHATUN",
    "nameDevanagari": "नजरुन खातून",
    "accountNumber": "129000777",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c206",
    "sn": 206,
    "name": "NURJAHA KHATUN",
    "nameDevanagari": "नुरजहाँ खातून",
    "accountNumber": "129001544",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c207",
    "sn": 207,
    "name": "BABITA DEVI",
    "nameDevanagari": "बबिता देवी",
    "accountNumber": "129000782",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c208",
    "sn": 208,
    "name": "MINAS DEVI",
    "nameDevanagari": "मिनास देवी",
    "accountNumber": "129000779",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c209",
    "sn": 209,
    "name": "BIKASH KUMAR",
    "nameDevanagari": "बिकाश कुमार",
    "accountNumber": "129000780",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c210",
    "sn": 210,
    "name": "GYASU MIYA ANSARI",
    "nameDevanagari": "ग्यासु मियाँ अंसारी",
    "accountNumber": "129000790",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c211",
    "sn": 211,
    "name": "SAHEB AALAM SEKH",
    "nameDevanagari": "साहेब आलम शेख",
    "accountNumber": "129000793",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c212",
    "sn": 212,
    "name": "SUNDARI KUMARI",
    "nameDevanagari": "सुन्दरी कुमारी",
    "accountNumber": "129000792",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c213",
    "sn": 213,
    "name": "RABIYA MIYA",
    "nameDevanagari": "राबिया मियाँ",
    "accountNumber": "129000803",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c214",
    "sn": 214,
    "name": "SESH LAL BABU",
    "nameDevanagari": "शेष लाल बाबु",
    "accountNumber": "129000805",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c215",
    "sn": 215,
    "name": "SOHIT PASWAN",
    "nameDevanagari": "सोहित पासवान",
    "accountNumber": "129000807",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c216",
    "sn": 216,
    "name": "MUKESH PRASAD KALWAR",
    "nameDevanagari": "मुकेश प्रसाद कलवार",
    "accountNumber": "129000808",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c217",
    "sn": 217,
    "name": "JAHANA KHATUN",
    "nameDevanagari": "जहाना खातून",
    "accountNumber": "129000815",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c218",
    "sn": 218,
    "name": "MUSLIM SAI",
    "nameDevanagari": "मुस्लिम साई",
    "accountNumber": "129000819",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c219",
    "sn": 219,
    "name": "NAJAMUL NESA",
    "nameDevanagari": "नजमुल नेसा",
    "accountNumber": "129000821",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c220",
    "sn": 220,
    "name": "KAMUN NESA",
    "nameDevanagari": "कमुन नेसा",
    "accountNumber": "129000820",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c221",
    "sn": 221,
    "name": "SABINA KHATUN",
    "nameDevanagari": "सबीना खातून",
    "accountNumber": "129000826",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c222",
    "sn": 222,
    "name": "HUSNEAARA KHATUN",
    "nameDevanagari": "हुस्नेआरा खातून",
    "accountNumber": "129000832",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c223",
    "sn": 223,
    "name": "KALIMA KHATUN",
    "nameDevanagari": "कलिमा खातून",
    "accountNumber": "129000831",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c224",
    "sn": 224,
    "name": "BASIR MIYA HAJAM",
    "nameDevanagari": "बसिर मियाँ हजाम",
    "accountNumber": "129000833",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c225",
    "sn": 225,
    "name": "NEHA KHATUN",
    "nameDevanagari": "नेहा खातून",
    "accountNumber": "129000837",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c226",
    "sn": 226,
    "name": "UPENDRA RAUT BIN",
    "nameDevanagari": "उपेन्द्र राउत बिन",
    "accountNumber": "129000836",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c227",
    "sn": 227,
    "name": "OJIGAR MIYA HAJAM",
    "nameDevanagari": "ओजीगर मियाँ हजाम",
    "accountNumber": "129000838",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c228",
    "sn": 228,
    "name": "SEKH AAJAD",
    "nameDevanagari": "शेख आजाद",
    "accountNumber": "129001298",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c229",
    "sn": 229,
    "name": "BHOLA KUMAR RAUT",
    "nameDevanagari": "भोला कुमार राउत",
    "accountNumber": "129000450",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c230",
    "sn": 230,
    "name": "MOHAN PASWAN",
    "nameDevanagari": "मोहन पासवान",
    "accountNumber": "129000845",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c231",
    "sn": 231,
    "name": "MOHAMAD ISHAK SAMANI",
    "nameDevanagari": "मोहम्मद इसहाक समानी",
    "accountNumber": "129000853",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c232",
    "sn": 232,
    "name": "MERAJ RAY",
    "nameDevanagari": "मेराज राय",
    "accountNumber": "129000851",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c233",
    "sn": 233,
    "name": "MANJUR ALAM",
    "nameDevanagari": "मन्जुर आलम",
    "accountNumber": "1859",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c234",
    "sn": 234,
    "name": "SEKH HUSAIN",
    "nameDevanagari": "शेख हुसेन",
    "accountNumber": "129000855",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c235",
    "sn": 235,
    "name": "CHANDAN PRASAD GUPTA",
    "nameDevanagari": "चन्दन प्रसाद गुप्ता",
    "accountNumber": "129000856",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c236",
    "sn": 236,
    "name": "AKHATAR ALI",
    "nameDevanagari": "अख्तर अली",
    "accountNumber": "129000863",
    "phone": "",
    "note": "200",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c237",
    "sn": 237,
    "name": "REHANA GURUNG KHATUN",
    "nameDevanagari": "रेहाना गुरुङ खातुन",
    "accountNumber": "129001833",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c238",
    "sn": 238,
    "name": "NAJAMA KHATUN",
    "nameDevanagari": "नजमा खातुन",
    "accountNumber": "129001836",
    "phone": "",
    "note": "200",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c239",
    "sn": 239,
    "name": "MAKBUL AHAMAD",
    "nameDevanagari": "मकबुल अहमद",
    "accountNumber": "129000859",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c240",
    "sn": 240,
    "name": "SESH AMODIN",
    "nameDevanagari": "शेष अमोदिन",
    "accountNumber": "129001837",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c241",
    "sn": 241,
    "name": "BINODH KUMAR SAH",
    "nameDevanagari": "बिनोद कुमार साह",
    "accountNumber": "129001824",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c242",
    "sn": 242,
    "name": "RABINA KHATUN",
    "nameDevanagari": "रबिना खातुन",
    "accountNumber": "129001532",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c243",
    "sn": 243,
    "name": "RAJIYA KHATUN",
    "nameDevanagari": "रजिया खातुन",
    "accountNumber": "129000290",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c244",
    "sn": 244,
    "name": "RANO PRABIN",
    "nameDevanagari": "रानो प्रबिन",
    "accountNumber": "129001801",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c245",
    "sn": 245,
    "name": "SHAMBHU MAHATO KOIRI",
    "nameDevanagari": "शम्भु महतो कोइरी",
    "accountNumber": "129000886",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c246",
    "sn": 246,
    "name": "SEKHA MUSTAK",
    "nameDevanagari": "शेख मुस्ताक",
    "accountNumber": "129000890",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c247",
    "sn": 247,
    "name": "JASMIN KHATUN THAKURAI",
    "nameDevanagari": "जास्मिन खातुन ठकुराई",
    "accountNumber": "129000887",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c248",
    "sn": 248,
    "name": "HRITIK KUNAR GUPTA",
    "nameDevanagari": "ऋतिक कुनार गुप्ता",
    "accountNumber": "129001775",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c249",
    "sn": 249,
    "name": "MUNI KHATUN",
    "nameDevanagari": "मुनी खातुन",
    "accountNumber": "129001023",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c250",
    "sn": 250,
    "name": "MADAN SAHNI MALAAH",
    "nameDevanagari": "मदन सहनी मलाह",
    "accountNumber": "129000993",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c251",
    "sn": 251,
    "name": "MUSATAK MIYA",
    "nameDevanagari": "मुस्तक मिया",
    "accountNumber": "129000966",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c252",
    "sn": 252,
    "name": "JAISUL NESA",
    "nameDevanagari": "जैसुल नेसा",
    "accountNumber": "129000986",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c253",
    "sn": 253,
    "name": "MUSKAN KHATUN",
    "nameDevanagari": "मुस्कान खातुन",
    "accountNumber": "129001025",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c254",
    "sn": 254,
    "name": "CHANDRIKA MAHATO NUNIYA",
    "nameDevanagari": "चन्द्रिका महतो नुनिया",
    "accountNumber": "129001028",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c255",
    "sn": 255,
    "name": "SATISH RAUT",
    "nameDevanagari": "सतिश राउत",
    "accountNumber": "129000296",
    "phone": "",
    "note": "300",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c256",
    "sn": 256,
    "name": "SAHNAJ KHATUN",
    "nameDevanagari": "सहनाज खातुन",
    "accountNumber": "129001139",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c257",
    "sn": 257,
    "name": "KRISHNA KUMAR PATEL",
    "nameDevanagari": "कृष्ण कुमार पटेल",
    "accountNumber": "129001466",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c258",
    "sn": 258,
    "name": "NAGMATI DEVI TURAHA",
    "nameDevanagari": "नागमती देवी तुरहा",
    "accountNumber": "129001189",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c259",
    "sn": 259,
    "name": "SAHINA KHATUN",
    "nameDevanagari": "सहिना खातुन",
    "accountNumber": "129001179",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c260",
    "sn": 260,
    "name": "NEK MOHAMD",
    "nameDevanagari": "नेक मोहम्मद",
    "accountNumber": "129001180",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c261",
    "sn": 261,
    "name": "NOSAD AALAM",
    "nameDevanagari": "नोसाद आलम",
    "accountNumber": "129001672",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c262",
    "sn": 262,
    "name": "SANJAY KUMAR SARAF",
    "nameDevanagari": "संजय कुमार सर्राफ",
    "accountNumber": "129001181",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c263",
    "sn": 263,
    "name": "SOSHILA DEVI",
    "nameDevanagari": "सुशिला देवी",
    "accountNumber": "129001153",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c264",
    "sn": 264,
    "name": "BINOD SAH KANU",
    "nameDevanagari": "बिनोद साह कानु",
    "accountNumber": "129001165",
    "phone": "",
    "note": "300",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c265",
    "sn": 265,
    "name": "RABINDAR KUMAR YADAV",
    "nameDevanagari": "रबिन्द्र कुमार यादव",
    "accountNumber": "129001202",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c266",
    "sn": 266,
    "name": "GAYATRI DEVI",
    "nameDevanagari": "गायत्री देवी",
    "accountNumber": "129001204",
    "phone": "",
    "note": "100",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c267",
    "sn": 267,
    "name": "BABLU KUMAR RAM",
    "nameDevanagari": "बबलु कुमार राम",
    "accountNumber": "129001201",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c268",
    "sn": 268,
    "name": "TETRI KUMARI",
    "nameDevanagari": "तेत्री कुमारी",
    "accountNumber": "129001200",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c269",
    "sn": 269,
    "name": "NAJIM BEGAM",
    "nameDevanagari": "नजिम बेगम",
    "accountNumber": "129001188",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c270",
    "sn": 270,
    "name": "OJIAR ANSARI",
    "nameDevanagari": "ओजियर अन्सारी",
    "accountNumber": "129001373",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c271",
    "sn": 271,
    "name": "ALIRAJ MAHMAD ANSARI",
    "nameDevanagari": "अलिराज महम्मद अन्सारी",
    "accountNumber": "129001333",
    "phone": "",
    "note": "500",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c272",
    "sn": 272,
    "name": "BIRENDAR SAH TELI",
    "nameDevanagari": "बिरेन्द्र साह तेली",
    "accountNumber": "129001364",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c273",
    "sn": 273,
    "name": "AJAY KUMAR",
    "nameDevanagari": "अजय कुमार",
    "accountNumber": "129001391",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c274",
    "sn": 274,
    "name": "SEKH WAJUL HAQUE",
    "nameDevanagari": "शेख वजुल हक",
    "accountNumber": "129001402",
    "phone": "",
    "note": "1000",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c275",
    "sn": 275,
    "name": "SABNAM KHATUN",
    "nameDevanagari": "सबनम खातुन",
    "accountNumber": "129001770",
    "phone": "",
    "note": "5600",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c276",
    "sn": 276,
    "name": "IMRAN ANSARI",
    "nameDevanagari": "इमरान अन्सारी",
    "accountNumber": "129001370",
    "phone": "",
    "note": "300",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c277",
    "sn": 277,
    "name": "KRISHANA HAJRA DUSAD",
    "nameDevanagari": "कृष्णा हजरा दुसाध",
    "accountNumber": "129001245",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c278",
    "sn": 278,
    "name": "SAMIR AKHTAR",
    "nameDevanagari": "समिर अख्तर",
    "accountNumber": "129001394",
    "phone": "",
    "note": "",
    "createdAt": "2026-01-01"
  },
  {
    "id": "c279",
    "sn": 279,
    "name": "GAYASU MIYA ANSARI",
    "nameDevanagari": "गयासु मिया अन्सारी",
    "accountNumber": "129001410",
    "phone": "",
    "note": "200",
    "createdAt": "2026-01-01"
  }
];

export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getYesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const INITIAL_COLLECTIONS: Record<string, DailyCollectionRecord> = {
  // Digitized historical collection sheet from 2026-10-25
  '2026-10-25': {
    date: '2026-10-25',
    entries: {
      c2: 100,  // SUSHITA KUMARI
      c4: 500,  // NAJMUDINA BABU THAKURAI
      c10: 100, // SAHINA KHATUN
      c11: 100, // SAHINA KHATUN (II)
      c19: 100, // AAS MAHMD ANSARI
      c20: 300, // HAMID MIYA
      c21: 300, // MUKHTAR ANSARI
      c23: 200, // MAIRUL NESHA KHATUN
      c24: 500, // TAAJMA KHATUN
      c29: 100, // SHIV PUJAN KUMAR PANDIT
      c30: 100, // GULSAN KHATUN
      c31: 100, // JAHIR DEVAN
      c32: 200, // NAAJMA KHATUN
      c34: 100, // ROSHAN KHATUN
      c36: 200, // NURJAHA KHATUN
      c37: 100, // SAFIK MIYA THAKURAI
      c39: 300, // SOYABA KHATUN
      c42: 200, // RAM EKBAL SAH
      c44: 500, // MD KALAMUDDIN
      c46: 150, // MANJU DEVI YADAV
      c50: 300, // ASGAR ALI
      c53: 250, // MOHAN PRASAD KESHARI
    },
    notes: {
      c4: 'पसल नं १८५',
      c20: 'साँझ भुक्तानी',
    },
    updatedAt: '2026-10-25T18:00:00.000Z',
  },
  // Previous day historical record from 2026-10-24
  '2026-10-24': {
    date: '2026-10-24',
    entries: {
      c1: 200,
      c2: 100,
      c3: 300,
      c4: 500,
      c6: 250,
      c10: 100,
      c13: 200,
      c15: 500,
      c19: 100,
      c20: 300,
      c21: 300,
      c27: 150,
      c29: 100,
      c42: 200,
      c45: 400,
      c48: 300,
    },
    updatedAt: new Date().toISOString(),
  },
};
