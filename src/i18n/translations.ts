export type Language = 'en' | 'mr';

export interface TranslationDictionary {
  nav: {
    portalSubtitle: string;
    submitLand: string;
    adminConsole: string;
    signInRegister: string;
    logout: string;
    publicPortal: string;
    languageToggle: string;
  };
  dashboardNav: {
    goToDashboard: string;
    goToOwnerDashboard: string;
    goToAgentDashboard: string;
    goToAdminConsole: string;
  };
  hero: {
    networkBadge: string;
    titlePart1: string;
    titlePart2: string;
    titlePart3: string;
    subtitle: string;
    exploreButton: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar1Tag: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar2Tag: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar3Tag: string;
    verifiedDevTitle: string;
    verifiedDevSubtitle: string;
    searchPlaceholder: string;
    allCities: string;
    allExpertise: string;
    resetFilters: string;
    noDevFound: string;
    noDevListed: string;
    viewProfile: string;
  };
  form: {
    titleNew: string;
    titleEdit: string;
    subtitle: string;
    channelPartnerPortal: string;
    landownerAlliance: string;
    directMandate: string;
    editExisting: string;
    viewAll: string;
    stepWizard: string;
    step1Label: string;
    step2Label: string;
    step3Label: string;
    step4Label: string;
    step1Desc: string;
    step2Desc: string;
    step3Desc: string;
    step4Desc: string;
    ownerName: string;
    ownerNamePlaceholder: string;
    ownerPhone: string;
    ownerPhonePlaceholder: string;
    city: string;
    cityPlaceholder: string;
    landLocation: string;
    landLocationPlaceholder: string;
    sectorNumber: string;
    sectorNumberPlaceholder: string;
    pincode: string;
    gatSurvey: string;
    gatSurveyPlaceholder: string;
    googleMaps: string;
    googleMapsPlaceholder: string;
    totalArea: string;
    areaUnit: string;
    roadWidth: string;
    plotFacing: string;
    zoning: string;
    dealStructure: string;
    revenueShare: string;
    securityDeposit: string;
    securityDepositDesc: string;
    expectedRent: string;
    expectedRentDesc: string;
    shiftingCharges: string;
    shiftingChargesDesc: string;
    redevelopmentHeader: string;
    totalPrice: string;
    pricePerUnit: string;
    priceNegotiable: string;
    priceNegotiableDesc: string;
    ownershipType: string;
    clearTitle: string;
    clearTitleDesc: string;
    litigationFree: string;
    litigationFreeDesc: string;
    agentTerms: string;
    agencyName: string;
    brokeragePct: string;
    description: string;
    descriptionPlaceholder: string;
    prevStep: string;
    continueTo: string;
    submitBtn: string;
    updateBtn: string;
    submitting: string;
    cancel: string;
    dealJdaTitle: string;
    dealJdaDesc: string;
    dealJvTitle: string;
    dealJvDesc: string;
    dealOutrightTitle: string;
    dealOutrightDesc: string;
    dealRedevTitle: string;
    dealRedevDesc: string;
    zoningRes: string;
    zoningComm: string;
    zoningInd: string;
    zoningAgri: string;
    zoningProp: string;
    unitAcres: string;
    unitGuntha: string;
    unitSqFeet: string;
    unitSqMeters: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      portalSubtitle: 'Land & Developer Alliance Suite',
      submitLand: 'Submit Land',
      adminConsole: 'Admin Console',
      signInRegister: 'Sign In / Register',
      logout: 'Logout',
      publicPortal: 'Public Portal',
      languageToggle: 'मराठी'
    },
    dashboardNav: {
      goToDashboard: 'Go to Dashboard',
      goToOwnerDashboard: 'Go to Owner Dashboard',
      goToAgentDashboard: 'Go to Agent Dashboard',
      goToAdminConsole: 'Go to Admin Console'
    },
    hero: {
      networkBadge: 'Institutional Real Estate Alliance Network',
      titlePart1: 'We Connect',
      titlePart2: 'Land Owners and Agents',
      titlePart3: 'to Trusted Developers',
      subtitle:
        "Accelerate high-value Joint Ventures (JV), Joint Development Agreements (JDA), Outright Acquisitions, and Urban Redevelopment. Directly matching verified land parcels with India's Tier-1 RERA-accredited builders.",
      exploreButton: 'Explore Trusted Developers',
      pillar1Title: 'For Land Owners',
      pillar1Desc:
        "Monetize your prime land parcel through structured Joint Ventures (JV) or outright buyout with India's most credible builders. Zero brokers clutter, audited financials, and guaranteed project delivery.",
      pillar1Tag: 'Direct Access to Tier-1 Capital',
      pillar2Title: 'For Real Estate Agents',
      pillar2Desc:
        'Bring your client mandates directly to the decision-makers. Protected alliance agreements, transparent underwriting criteria, faster closing cycles, and guaranteed channel incentives.',
      pillar2Tag: 'Protected Mandate Rights',
      pillar3Title: 'For Verified Developers',
      pillar3Desc:
        'Source institutionally verified land parcels with audited title search reports, clear survey maps, and direct landowner access without intermediary friction.',
      pillar3Tag: 'Audited Title Parcels',
      verifiedDevTitle: 'Verified Real Estate Developers',
      verifiedDevSubtitle:
        'Explore corporate track records, RERA registrations, ongoing townships, and core execution expertise across major urban growth centers.',
      searchPlaceholder: 'Search developer by name, RERA, or city...',
      allCities: 'All Cities',
      allExpertise: 'All Expertise',
      resetFilters: 'Reset Filters',
      noDevFound: 'No Developers Match Your Filter',
      noDevListed: 'No Developers Currently Listed',
      viewProfile: 'View Portfolio & Mandate Terms'
    },
    form: {
      titleNew: 'Submit Land for Review',
      titleEdit: 'Edit Land Parcel',
      subtitle: 'Publish parcel specs to accredited Tier-1 developers for Joint Development, JV, or Outright Acquisition.',
      channelPartnerPortal: 'Channel Partner Portal',
      landownerAlliance: 'Landowner Alliance',
      directMandate: 'Direct Developer Mandate',
      editExisting: 'Edit Existing Submission',
      viewAll: 'View All Sections',
      stepWizard: 'Step-by-Step Wizard',
      step1Label: 'Location Details',
      step2Label: 'Dimensions & Zoning',
      step3Label: 'Commercials & Deal',
      step4Label: 'Legal & Assurances',
      step1Desc: 'Exact geography, survey references, and road connectivity.',
      step2Desc: 'Cadastral land boundaries, statutory zoning, and dimension metrics.',
      step3Desc: 'Deal structure (JDA, JV, Outright), revenue share %, and valuation expectations.',
      step4Desc: 'Title certification, ownership documentation, and channel partner representation.',
      ownerName: 'Land Owner Name',
      ownerNamePlaceholder: 'e.g. Ramesh Patil',
      ownerPhone: 'Land Owner Phone Number',
      ownerPhonePlaceholder: 'e.g. 9876543210',
      city: 'City',
      cityPlaceholder: 'e.g. Pune',
      landLocation: 'Land Location',
      landLocationPlaceholder: 'e.g. Hinjewadi Phase 1',
      sectorNumber: 'Sector Number',
      sectorNumberPlaceholder: 'e.g. S-42',
      pincode: 'Pincode (6 Digits)',
      gatSurvey: 'Gat Number / Survey Number',
      gatSurveyPlaceholder: 'e.g. Gat No. 142/1, Survey No. 88',
      googleMaps: 'Google Maps Location Link',
      googleMapsPlaceholder: 'https://maps.google.com/?q=...',
      totalArea: 'Total Parcel Land Area',
      areaUnit: 'Area Unit',
      roadWidth: 'Front Road Width (Feet)',
      plotFacing: 'Plot Facing',
      zoning: 'Master Plan Zoning Category',
      dealStructure: 'Proposed Deal Structure',
      revenueShare: 'Expected Revenue / Area Share % for Landowner',
      securityDeposit: 'Expected Security Deposit (₹)',
      securityDepositDesc: 'Refundable or non-refundable security deposit / financial advance expected from the builder upon signing.',
      expectedRent: 'Expected Rent (₹ / Month)',
      expectedRentDesc: 'Monthly hardship rental compensation for temporary alternative accommodation during construction.',
      shiftingCharges: 'Shifting Charges / Accommodation (₹)',
      shiftingChargesDesc: 'One-time shifting, brokerage, and logistical displacement compensation.',
      redevelopmentHeader: 'Redevelopment Terms & Relocation Compensation',
      totalPrice: 'Expected Total Price (₹)',
      pricePerUnit: 'Price per',
      priceNegotiable: 'Price Negotiability',
      priceNegotiableDesc: 'Is the expected valuation open for institutional structuring?',
      ownershipType: 'Title & Ownership Classification',
      clearTitle: 'Clear & Marketable Title',
      clearTitleDesc: 'Single/Joint ownership deed with unencumbered chain of mutation.',
      litigationFree: '100% Litigation Free',
      litigationFreeDesc: 'No active stay orders, court disputes, or revenue appeals.',
      agentTerms: 'Real Estate Channel Partner Terms',
      agencyName: 'Agency / Advisory Company Name',
      brokeragePct: 'Expected Institutional Brokerage % (0% - 5%)',
      description: 'Parcel Description & Strategic Highlights',
      descriptionPlaceholder: 'e.g. Clear title parcel suitable for group housing. Direct frontage on 60ft master road with quick access to highway corridor.',
      prevStep: 'Previous Section',
      continueTo: 'Continue to Section',
      submitBtn: 'Submit Land for Review',
      updateBtn: 'Update Land Parcel',
      submitting: 'Submitting Parcel Specs...',
      cancel: 'Cancel',
      dealJdaTitle: 'Joint Development (JDA)',
      dealJdaDesc: 'Landowner contributes land; Builder executes and shares finished area or revenue.',
      dealJvTitle: 'Joint Venture (JV)',
      dealJvDesc: 'Special Purpose Vehicle (SPV) formed with joint equity participation.',
      dealOutrightTitle: 'Outright Sale',
      dealOutrightDesc: '100% upfront asset transfer against institutional cash payout.',
      dealRedevTitle: 'Redevelopment',
      dealRedevDesc: 'Society or plot redevelopment with modernized reconstruction and area/corpus allocation.',
      zoningRes: 'Residential',
      zoningComm: 'Commercial',
      zoningInd: 'Industrial',
      zoningAgri: 'Agricultural',
      zoningProp: 'Proposed',
      unitAcres: 'Acres',
      unitGuntha: 'Guntha',
      unitSqFeet: 'Sq. Feet',
      unitSqMeters: 'Sq. Meters'
    }
  },
  mr: {
    nav: {
      portalSubtitle: 'जमीन व विकासक भागीदारी मंच',
      submitLand: 'जमीन दाखल करा',
      adminConsole: 'प्रशासक कन्सोल',
      signInRegister: 'साइन इन / नोंदणी',
      logout: 'बाहेर पडा',
      publicPortal: 'मुख्य पोर्टल',
      languageToggle: 'English'
    },
    dashboardNav: {
      goToDashboard: 'डॅशबोर्डवर जा',
      goToOwnerDashboard: 'जमीन मालक डॅशबोर्ड',
      goToAgentDashboard: 'एजंट डॅशबोर्ड',
      goToAdminConsole: 'प्रशासक कन्सोल'
    },
    hero: {
      networkBadge: 'संस्थात्मक रिअल इस्टेट विकास भागीदारी नेटवर्क',
      titlePart1: 'आम्ही जोडतो',
      titlePart2: 'जमीन मालक व एजंट्सना',
      titlePart3: 'विश्वसनीय विकासकांशी',
      subtitle:
        'संयुक्त भागीदारी (JV), संयुक्त विकास करार (JDA), थेट खरेदी-विक्री आणि शहरी पुनर्विकासाला गती द्या. खात्रीशीर जमीन पार्सल्स थेट भारतातील नामांकित RERA-नोंदणीकृत बिल्डर्सशी जोडणारा मंच.',
      exploreButton: 'विश्वसनीय विकासक शोधा',
      pillar1Title: 'जमीन मालकांसाठी',
      pillar1Desc:
        'आपली मौल्यवान जमीन नामांकित विकासकांसोबत संयुक्त भागीदारी (JV) किंवा थेट विक्रीद्वारे विकसित करा. मध्यस्थांशिवाय थेट व्यवहार, पारदर्शक हिशोब आणि वेळेत प्रकल्प पूर्तता.',
      pillar1Tag: 'थेट नामांकित बिल्डर्सशी व्यवहार',
      pillar2Title: 'रिअल इस्टेट एजंट्ससाठी',
      pillar2Desc:
        'आपल्या क्लायंटचे लँड प्रपोजल थेट मुख्य निर्णयकर्त्यांपर्यंत पोहोचवा. सुरक्षित व्यावसायिक करार, पारदर्शक मूल्यांकन प्रक्रिया आणि निश्चित ब्रोकरेज.',
      pillar2Tag: 'सुरक्षित एजन्सी हक्क',
      pillar3Title: 'नोंदणीकृत विकासकांसाठी',
      pillar3Desc:
        'कायदेशीर पडताळणी झालेले, निर्वेध आणि स्वच्छ टायटल (७/१२ फेरफार) असलेले भूखंड थेट जमीन मालकांकडून विनाअडथळा मिळवा.',
      pillar3Tag: 'तपासणी झालेले कायदेशीर भूखंड',
      verifiedDevTitle: 'मान्यताप्राप्त रिअल इस्टेट विकासक',
      verifiedDevSubtitle:
        'विविध शहरांमधील नामांकित विकासकांचे प्रकल्प, RERA नोंदणी क्रमांक, अनुभव आणि काम पाहा.',
      searchPlaceholder: 'विकासकाचे नाव, RERA क्रमांक किंवा शहरावरून शोधा...',
      allCities: 'सर्व शहरे',
      allExpertise: 'सर्व कौशल्ये',
      resetFilters: 'फिल्टर्स पूर्ववत करा',
      noDevFound: 'दिलेल्या फिल्टर्सनुसार विकासक सापडले नाहीत',
      noDevListed: 'सध्या विकासक उपलब्ध नाहीत',
      viewProfile: 'प्रोफाइल व प्रकल्प पाहा'
    },
    form: {
      titleNew: 'पुनरावलोकनासाठी जमीन दाखल करा',
      titleEdit: 'जमिनीच्या माहितीत बदल करा',
      subtitle: 'संयुक्त विकास करार (JDA), JV किंवा थेट विक्रीसाठी जमिनीचा प्रस्ताव नामांकित विकासकांना पाठवा.',
      channelPartnerPortal: 'चॅनल पार्टनर पोर्टल',
      landownerAlliance: 'जमीन मालक आघाडी',
      directMandate: 'थेट विकासक व्यवहार',
      editExisting: 'दाखल केलेली माहिती संपादित करा',
      viewAll: 'सर्व विभाग एकाच वेळी पाहा',
      stepWizard: 'टप्प्याटप्प्याने फॉर्म भरा',
      step1Label: 'स्थान तपशील',
      step2Label: 'क्षेत्रफळ व झोनिंग',
      step3Label: 'आर्थिक व करार रचना',
      step4Label: 'कायदेशीर पडताळणी',
      step1Desc: 'अचूक भौगोलिक स्थान, सर्व्हे नंबर संदर्भ आणि रस्त्याची कनेक्टिव्हिटी.',
      step2Desc: 'जमिनीच्या सीमा, वैधानिक झोनिंग श्रेणी आणि क्षेत्रफळ मापे.',
      step3Desc: 'करार रचना (JDA, JV, थेट विक्री), महसूल हिस्सा % आणि अपेक्षित मूल्यांकन.',
      step4Desc: 'टायटल पडताळणी, मालकी दस्तऐवज आणि एजंट प्रतिनिधी तपशील.',
      ownerName: 'जमीन मालकाचे नाव',
      ownerNamePlaceholder: 'उदा. रमेश पाटील',
      ownerPhone: 'जमीन मालकाचा फोन नंबर',
      ownerPhonePlaceholder: 'उदा. ९८७६५४३२१०',
      city: 'शहर',
      cityPlaceholder: 'उदा. पुणे',
      landLocation: 'जमिनीचे ठिकाण / परिसर',
      landLocationPlaceholder: 'उदा. हिंजवडी फेज १',
      sectorNumber: 'सेक्टर नंबर',
      sectorNumberPlaceholder: 'उदा. एस-४२',
      pincode: 'पिनकोड (६ अंकी)',
      gatSurvey: 'गट नंबर / सर्व्हे नंबर',
      gatSurveyPlaceholder: 'उदा. गट नं. १४२/१, सर्व्हे नं. ८८',
      googleMaps: 'गुगल मॅप्स लोकेशन लिंक',
      googleMapsPlaceholder: 'https://maps.google.com/?q=...',
      totalArea: 'एकूण जमिनीचे क्षेत्रफळ',
      areaUnit: 'क्षेत्रफळ एकक',
      roadWidth: 'समोरील रस्त्याची रुंदी (फूट)',
      plotFacing: 'प्लॉटची दिशा / मुख',
      zoning: 'मास्टर प्लॅन झोनिंग श्रेणी',
      dealStructure: 'प्रस्तावित करार रचना',
      revenueShare: 'जमीन मालकासाठी अपेक्षित महसूल / क्षेत्रफळ हिस्सा %',
      securityDeposit: 'अपेक्षित अनामत रक्कम (Security Deposit ₹)',
      securityDepositDesc: 'करार नोंदणीवेळी विकासकाकडून अपेक्षित असणारी अनामत रक्कम / आगाऊ रक्कम.',
      expectedRent: 'अपेक्षित मासिक घरभाडे (₹ / महिना)',
      expectedRentDesc: 'बांधकाम कालावधीत तात्पुरत्या पर्यायी राहण्याच्या व्यवस्थेसाठी मासिक घरभाडे.',
      shiftingCharges: 'स्थलांतर व राहण्याचा खर्च (₹)',
      shiftingChargesDesc: 'सामान हलवणे, ब्रोकरेज व तात्पुरत्या स्थलांतराचा एकरकमी खर्च.',
      redevelopmentHeader: 'पुनर्विकास अटी व स्थलांतर भरपाई',
      totalPrice: 'अपेक्षित एकूण किंमत (₹)',
      pricePerUnit: 'प्रति दर',
      priceNegotiable: 'किंमत वाटाघाटीस खुली आहे का?',
      priceNegotiableDesc: 'अपेक्षित मूल्यांकनावर संस्थात्मक पातळीवर वाटाघाटी शक्य आहेत का?',
      ownershipType: 'मालकी हक्क प्रकार',
      clearTitle: 'निर्वेध व कायदेशीर मालकी (क्लियर टायटल)',
      clearTitleDesc: 'एकल किंवा संयुक्त मालकी, स्वच्छ ७/१२ आणि निर्वेध फेरफार नोंद.',
      litigationFree: '१००% न्यायालयीन वादमुक्त',
      litigationFreeDesc: 'कोणतीही न्यायालयीन स्थगिती, वाद किंवा महसूल अपील्स प्रलंबित नाहीत.',
      agentTerms: 'रिअल इस्टेट चॅनल पार्टनर अटी',
      agencyName: 'एजन्सी / सल्लागार कंपनीचे नाव',
      brokeragePct: 'अपेक्षित संस्थात्मक ब्रोकरेज % (०% - ५%)',
      description: 'जमिनीची वैशिष्ट्ये व महत्त्वाची माहिती',
      descriptionPlaceholder: 'उदा. गृहनिर्माण प्रकल्पासाठी योग्य क्लियर टायटल जागा. ६० फूट रस्त्याला लागून आणि हायवे कॉरिडॉरशी जलद कनेक्टिव्हिटी.',
      prevStep: 'मागील टप्पा',
      continueTo: 'पुढील टप्प्यावर जा: विभाग',
      submitBtn: 'जमिनीचा प्रस्ताव दाखल करा',
      updateBtn: 'माहिती अपडेट करा',
      submitting: 'माहिती दाखल होत आहे...',
      cancel: 'रद्द करा',
      dealJdaTitle: 'संयुक्त विकास करार (JDA)',
      dealJdaDesc: 'जमीन मालक जमीन देईल; बिल्डर बांधकाम पूर्ण करून तयार क्षेत्रफळ किंवा महसूल वाटून घेईल.',
      dealJvTitle: 'संयुक्त भागीदारी (JV)',
      dealJvDesc: 'संयुक्त भागभांडवलासह स्वतंत्र SPV कंपनी स्थापन करून भागीदारी.',
      dealOutrightTitle: 'थेट खरेदी-विक्री (Outright)',
      dealOutrightDesc: 'एकरकमी रोख रकमेच्या मोबदल्यात १००% मालकी हक्क हस्तांतरण.',
      dealRedevTitle: 'पुनर्विकास (Redevelopment)',
      dealRedevDesc: 'सोसायटी किंवा प्लॉटचा पुनर्विकास करून आधुनिक इमारत व नवीन घरांचे वाटप.',
      zoningRes: 'निवासी (Residential)',
      zoningComm: 'व्यावसायिक (Commercial)',
      zoningInd: 'औद्योगिक (Industrial)',
      zoningAgri: 'शेती / कृषी (Agricultural)',
      zoningProp: 'प्रस्तावित (Proposed)',
      unitAcres: 'एकर (Acres)',
      unitGuntha: 'गुंठा (Guntha)',
      unitSqFeet: 'चौ. फूट (Sq. Feet)',
      unitSqMeters: 'चौ. मीटर (Sq. Meters)'
    }
  }
};
