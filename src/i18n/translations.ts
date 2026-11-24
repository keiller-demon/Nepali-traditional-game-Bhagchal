export type Language = 'en' | 'ne';

export interface TranslationBundle {
  brandTitle: string;
  brandSubtitle: string;
  nav: {
    play: string;
    learn: string;
    strategy: string;
    history: string;
    archive: string;
  };
  langToggle: string;
  hero: {
    kicker: string;
    headline: string;
    summary: string;
    playCta: string;
    learnCta: string;
    caption: string;
  };
  play: {
    title: string;
    modeVsAi: string;
    modeLocal: string;
    modePractice: string;
    modeReplay: string;
    playAs: string;
    goat: string;
    tiger: string;
    difficulty: string;
    beginner: string;
    intermediate: string;
    expert: string;
    drawPolicy: string;
    newGame: string;
    undo: string;
    hint: string;
    offerDraw: string;
    soundOn: string;
    soundOff: string;
    coordsOn: string;
    coordsOff: string;
    phasePlacement: string;
    phaseMovement: string;
    turnGoat: string;
    turnTiger: string;
    goatsReserve: string;
    goatsOnBoard: string;
    goatsCaptured: string;
    trappedTigers: string;
    aiThinking: string;
    coachNote: string;
    moveLog: string;
    noMovesYet: string;
    exportMatch: string;
    importMatch: string;
    saveToLibrary: string;
    matchSaved: string;
    tigerWinsTitle: string;
    goatWinsTitle: string;
    drawTitle: string;
    tigerWinsDesc: string;
    goatWinsDesc: string;
    drawRepetitionDesc: string;
    drawMutualDesc: string;
    playAgain: string;
    selectGoatHint: string;
    placeGoatHint: string;
    selectTigerHint: string;
    threatWarning: string;
    replayStep: string;
    replayFirst: string;
    replayPrev: string;
    replayPlay: string;
    replayPause: string;
    replayNext: string;
    replayLast: string;
    sampleGames: string;
    onlineNote: string;
    exportRulesJson: string;
    exportRulesMd: string;
  };
  offline: {
    banner: string;
    installApp: string;
    installIOS: string;
    iosTitle: string;
    iosSteps: string;
    close: string;
  };
  sections: {
    learnTitle: string;
    learnSubtitle: string;
    strategyTitle: string;
    strategySubtitle: string;
    historyTitle: string;
    historySubtitle: string;
    archiveTitle: string;
    archiveSubtitle: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  en: {
    brandTitle: 'Bagh-Chal',
    brandSubtitle: 'The Traditional Nepali Tigers and Goats Game',
    nav: {
      play: 'Play',
      learn: 'Guide',
      strategy: 'Strategy',
      history: 'History',
      archive: 'Archive',
    },
    langToggle: 'नेपाली',
    hero: {
      kicker: 'Digital Cultural Heritage Preservation · Nepal',
      headline: 'Bagh-Chal (बाघचाल)',
      summary:
        'Four tigers hunt across twenty-five intersections while twenty goats coordinate to seal every escape route. Play offline on a faithful 5×5 wooden board, study interactive lessons, and contribute to an open heritage archive.',
      playCta: 'Play Bagh-Chal',
      learnCta: 'Interactive Guide',
      caption: 'Fig. 1 — Carved rosewood tigers and pale boxwood goats arranged on a traditional Nepali chautari board.',
    },
    play: {
      title: 'The Game Board',
      modeVsAi: 'vs AI',
      modeLocal: 'Local 2-Player',
      modePractice: 'Practice Coach',
      modeReplay: 'Replay',
      playAs: 'Play As',
      goat: 'Goats (Bakhra)',
      tiger: 'Tigers (Bagh)',
      difficulty: 'AI Strength',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      expert: 'Expert',
      drawPolicy: 'Draw Policy',
      newGame: 'New Game',
      undo: 'Undo',
      hint: 'Suggest Move',
      offerDraw: 'Agree Draw',
      soundOn: 'Sound On',
      soundOff: 'Muted',
      coordsOn: 'Labels On',
      coordsOff: 'Labels Off',
      phasePlacement: 'Phase A · Goat Placement',
      phaseMovement: 'Phase B · Board Movement',
      turnGoat: 'Goat Turn',
      turnTiger: 'Tiger Turn',
      goatsReserve: 'Reserve Goats',
      goatsOnBoard: 'On Board',
      goatsCaptured: 'Captured',
      trappedTigers: 'Trapped Tigers',
      aiThinking: 'Analyzing board...',
      coachNote: 'Tactical Analysis',
      moveLog: 'Move Record',
      noMovesYet: 'Goats open the match by placing a piece on any empty intersection.',
      exportMatch: 'Export JSON',
      importMatch: 'Import JSON',
      saveToLibrary: 'Save Match',
      matchSaved: 'Saved locally',
      tigerWinsTitle: 'Tigers Victorious',
      goatWinsTitle: 'Goats Victorious',
      drawTitle: 'Match Drawn',
      tigerWinsDesc: 'Five goats have been captured across the board.',
      goatWinsDesc: 'All four tigers are immobilized with no legal move or jump.',
      drawRepetitionDesc: 'Threefold position repetition reached under the active tournament safeguard.',
      drawMutualDesc: 'Concluded by mutual agreement.',
      playAgain: 'Play Again',
      selectGoatHint: 'Select a goat on the board, then choose an adjacent empty intersection.',
      placeGoatHint: 'Click any empty intersection to place a goat from reserve.',
      selectTigerHint: 'Select a tiger to move one step or jump over an adjacent goat.',
      threatWarning: 'Capture threat active',
      replayStep: 'Move',
      replayFirst: 'Start',
      replayPrev: 'Prev',
      replayPlay: 'Auto',
      replayPause: 'Pause',
      replayNext: 'Next',
      replayLast: 'End',
      sampleGames: 'Load Sample Match',
      onlineNote:
        'Offline-first architecture: play locally or export/import match JSON codes for correspondence play without accounts.',
      exportRulesJson: 'Rules Spec (JSON)',
      exportRulesMd: 'Rules Spec (Markdown)',
    },
    offline: {
      banner: 'Offline Mode — Playing with cached local rules & archive',
      installApp: 'Install App',
      installIOS: 'Install on iOS',
      iosTitle: 'Install Bagh-Chal on iPhone / iPad',
      iosSteps: 'Tap the Share icon in Safari, then choose Add to Home Screen for full offline play.',
      close: 'Close',
    },
    sections: {
      learnTitle: 'Complete Playing Guide',
      learnSubtitle:
        'Master all twenty-five intersections, placement tactics, capture geometry, and victory conditions through step-by-step interactive boards.',
      strategyTitle: 'Strategy & Tactical Puzzles',
      strategySubtitle:
        'Separate battle doctrines for Tigers and Goats across three skill tiers, paired with interactive board puzzles.',
      historyTitle: 'History & Cultural Heritage',
      historySubtitle:
        'An evidence-based historical record distinguishing documented research and material culture from oral traditions.',
      archiveTitle: 'Community Heritage Archive',
      archiveSubtitle:
        'Open, downloadable cultural records with contributor attribution, explicit consent, and open licensing.',
    },
  },
  ne: {
    brandTitle: 'बाघचाल',
    brandSubtitle: 'परम्परागत नेपाली बाघ र बाख्राको रणनीतिक खेल',
    nav: {
      play: 'खेल्नुहोस्',
      learn: 'नियम गाइड',
      strategy: 'रणनीति',
      history: 'इतिहास',
      archive: 'सङ्ग्रह',
    },
    langToggle: 'English',
    hero: {
      kicker: 'डिजिटल सांस्कृतिक सम्पदा संरक्षण · नेपाल',
      headline: 'बाघचाल (Bagh-Chal)',
      summary:
        'पच्चीस बिन्दुहरूको पाटीमा चार बाघले शिकार खोज्छन् भने बीस बाख्राले तिनीहरूको चारै बाटो थुन्ने प्रयास गर्छन्। इन्टरनेट बिना नै परम्परागत काठे पाटीमा खेल्नुहोस्, नियम सिक्नुहोस् र खुला सम्पदा सङ्ग्रहमा योगदान गर्नुहोस्।',
      playCta: 'बाघचाल खेल्नुहोस्',
      learnCta: 'अन्तर्क्रियात्मक गाइड',
      caption: 'चित्र १ — परम्परागत नेपाली चौतारीको पाटीमा सजिसजाउ काठका बाघ र बाख्राका गोटीहरू।',
    },
    play: {
      title: 'खेल पाटी',
      modeVsAi: 'एआई विरुद्ध',
      modeLocal: 'दुई खेलाडी',
      modePractice: 'अभ्यास प्रशिक्षक',
      modeReplay: 'पुनः हेर्नुहोस्',
      playAs: 'पक्ष छान्नुहोस्',
      goat: 'बाख्रा',
      tiger: 'बाघ',
      difficulty: 'एआई स्तर',
      beginner: 'सुरुवाती',
      intermediate: 'मध्यम',
      expert: 'दक्ष',
      drawPolicy: 'बराबरी नियम',
      newGame: 'नयाँ खेल',
      undo: 'पछाडि फर्कनुहोस्',
      hint: 'सुझाव लिनुहोस्',
      offerDraw: 'सहमतिमा बराबरी',
      soundOn: 'ध्वनि चालु',
      soundOff: 'ध्वनि बन्द',
      coordsOn: 'संकेत चालु',
      coordsOff: 'संकेत बन्द',
      phasePlacement: 'चरण क · बाख्रा राख्ने क्रम',
      phaseMovement: 'चरण ख · गोटी सार्ने क्रम',
      turnGoat: 'बाख्राको पालो',
      turnTiger: 'बाघको पालो',
      goatsReserve: 'बाँकी बाख्रा',
      goatsOnBoard: 'पाटीमा बाख्रा',
      goatsCaptured: 'खाइएका बाख्रा',
      trappedTigers: 'थुनिएका बाघ',
      aiThinking: 'चाल विश्लेषण हुँदैछ...',
      coachNote: 'रणनीतिक विश्लेषण',
      moveLog: 'चाल अभिलेख',
      noMovesYet: 'कुनै पनि खाली बिन्दुमा बाख्रा राखेर खेल सुरु गर्नुहोस्।',
      exportMatch: 'JSON निर्यात',
      importMatch: 'JSON आयात',
      saveToLibrary: 'खेल सुरक्षित',
      matchSaved: 'स्थानीय रूपमा सुरक्षित',
      tigerWinsTitle: 'बाघको जित',
      goatWinsTitle: 'बाख्राको जित',
      drawTitle: 'खेल बराबरी',
      tigerWinsDesc: 'पाटीमा पाँच बाख्राको शिकार पूरा भएको छ।',
      goatWinsDesc: 'चारै बाघको चाल र छलाङ पूर्ण रूपमा थुनिएको छ।',
      drawRepetitionDesc: 'एकै अवस्था तीन पटक दोहोरिएकाले आधुनिक बराबरी नियम लागू भयो।',
      drawMutualDesc: 'दुवै खेलाडीको सहमतिमा बराबरी टुङ्गियो।',
      playAgain: 'फेरि खेल्नुहोस्',
      selectGoatHint: 'पाटीमा रहेको बाख्रा छान्नुहोस् र जोडिएको खाली बिन्दुमा सार्नुहोस्।',
      placeGoatHint: 'कुनै पनि खाली बिन्दुमा थिचेर बाख्रा राख्नुहोस्।',
      selectTigerHint: 'बाघ छानेर जोडिएको बिन्दुमा सार्नुहोस् वा बाख्रामाथि उफ्रिएर खानुहोस्।',
      threatWarning: 'शिकारको खतरा सक्रिय छ',
      replayStep: 'चाल',
      replayFirst: 'सुरु',
      replayPrev: 'अघिल्लो',
      replayPlay: 'स्वतः',
      replayPause: 'रोक्नुहोस्',
      replayNext: 'अर्को',
      replayLast: 'अन्त्य',
      sampleGames: 'नमूना खेल लोड',
      onlineNote:
        'खाता बिना अफलाइन चल्ने प्रणाली: स्थानीय रूपमा खेल्नुहोस् वा पत्राचार खेलका लागि JSON फाइल साटासाट गर्नुहोस्।',
      exportRulesJson: 'नियम (JSON)',
      exportRulesMd: 'नियम (Markdown)',
    },
    offline: {
      banner: 'अफलाइन मोड — स्थानीय नियम र सङ्ग्रह प्रयोग भइरहेको छ',
      installApp: 'एप इन्स्टल',
      installIOS: 'iOS मा इन्स्टल',
      iosTitle: 'iPhone / iPad मा बाघचाल इन्स्टल गर्नुहोस्',
      iosSteps: 'Safari मा Share बटन थिच्नुहोस् र Add to Home Screen छान्नुहोस्।',
      close: 'बन्द गर्नुहोस्',
    },
    sections: {
      learnTitle: 'सम्पू्र्ण खेल निर्देशिका',
      learnSubtitle:
        'पच्चीस बिन्दुको संरचना, बाख्रा राख्ने विधि, बाघले खाने नियम र जित्ने सर्तहरू चरणबद्ध अभ्यासबाट सिक्नुहोस्।',
      strategyTitle: 'रणनीति तथा रणकौशल पहेली',
      strategySubtitle:
        'बाघ र बाख्रा दुवै पक्षका लागि तीन स्तरका रणनीति र अभ्यास पहेलीहरू।',
      historyTitle: 'इतिहास तथा सांस्कृतिक सम्पदा',
      historySubtitle:
        'प्रमाणित ऐतिहासिक तथ्य, शैक्षिक अनुसन्धान र मौखिक परम्परालाई स्पष्ट छुट्याएर प्रस्तुत गरिएको दस्तावेज।',
      archiveTitle: 'सामुदायिक सम्पदा सङ्ग्रह',
      archiveSubtitle:
        'योगदानकर्ताको नाम, स्पष्ट अनुमति र खुला इजाजतपत्र सहितको डाउनलोडयोग्य सांस्कृतिक अभिलेख।',
    },
  },
};
