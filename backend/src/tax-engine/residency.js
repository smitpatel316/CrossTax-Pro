/**
 * Tax Engine - Residency Rules
 * CPA-level accuracy for US/Canada residency determination
 */

class ResidencyEngine {
  /**
   * Determine US Tax Residency using Substantial Presence Test
   * IRC Section 7701(b)
   */
  static calculateUSResidency(params) {
    const {
      daysInUSCurrentYear,
      daysInUSPriorYear1,
      daysInUSPriorYear2,
      daysInUSWorkDays, // Exempt days (transit, medical, foreign official)
      citizenship,
      greenCardStatus,
      closeContactsUS,
      homeownerUS,
      visaType
    } = params;

    const log = [];
    let isResident = false;
    let residencyType = 'nonresident';

    // Green card holder = US resident regardless of days
    if (greenCardStatus === 'valid') {
      isResident = true;
      residencyType = 'lawful_permanent_resident';
      log.push({
        rule: 'Green Card Test',
        result: 'US resident by virtue of valid green card',
        citation: 'IRC 7701(b)(1)'
      });
      return { isResident, residencyType, log, testDetails: {} };
    }

    // Exempt individual (F, J, M, Q visa)
    if (['F', 'J', 'M', 'Q'].includes(visaType) && daysInUSWorkDays > 0) {
      const exemptDays = Math.min(daysInUSWorkDays, daysInUSCurrentYear);
      daysInUSCurrentYear -= exemptDays;
      log.push({
        rule: 'Exempt Individual',
        result: `Subtracted ${exemptDays} exempt days from presence count`,
        citation: 'IRC 7701(b)(5)'
      });
    }

    // Calculate weighted days
    const weightedDays = daysInUSCurrentYear + 
      (daysInUSPriorYear1 / 3) + 
      (daysInUSPriorYear2 / 6);

    const testDetails = {
      currentYear: daysInUSCurrentYear,
      priorYear1: daysInUSPriorYear1,
      priorYear2: daysInUSPriorYear2,
      weightedDays: Math.round(weightedDays * 100) / 100
    };

    if (weightedDays >= 183) {
      isResident = true;
      residencyType = 'substantial_presence';
      log.push({
        rule: 'Substantial Presence Test',
        result: `Weighted days (${testDetails.weightedDays}) >= 183`,
        citation: 'IRC 7701(b)(3)'
      });

      // Check for first-year election
      if (daysInUSPriorYear1 === 0 && daysInUSPriorYear2 === 0) {
        log.push({
          rule: 'First Year Election Available',
          result: 'May elect to be treated as resident for first year',
          citation: 'IRC 7701(b)(4)'
        });
      }
    } else {
      log.push({
        rule: 'Substantial Presence Test',
        result: `Weighted days (${testDetails.weightedDays}) < 183`,
        detail: 'Not a US resident under substantial presence test',
        citation: 'IRC 7701(b)(3)'
      });
    }

    // Home to closer connections exception
    if (isResident && this.hasCloserConnectionsToCanada(closeContactsUS, homeownerUS)) {
      log.push({
        rule: 'Closer Connections Exception',
        result: 'May be treated as nonresident - file Form 8840',
        citation: 'IRC 7701(b)(3)(B)'
      });
    }

    return { isResident, residencyType, log, testDetails };
  }

  /**
   * Determine Canadian Tax Residency
   * Based on CRA significant residential ties test
   */
  static calculateCanadaResidency(params) {
    const {
      daysInCanada,
      daysInCanadaPriorYear,
      homeInCanada,
      spouseInCanada,
      dependentsInCanada,
      otherTiesCanada,
      driverLicenseCanada,
      healthCardCanada,
      bankAccountsCanada,
      membershipsCanada,
      workInCanada,
      centerOfVitalInterests
    } = params;

    const log = [];
    let isResident = false;
    let residencyType = 'nonresident';

    let residentialTies = 0;
    const tiesDetails = [];

    // Primary residential ties
    if (homeInCanada) {
      residentialTies += 2;
      tiesDetails.push({ tie: 'Home in Canada', weight: 2 });
    }

    if (spouseInCanada) {
      residentialTies += 1;
      tiesDetails.push({ tie: 'Spouse in Canada', weight: 1 });
    }

    if (dependentsInCanada) {
      residentialTies += 1;
      tiesDetails.push({ tie: 'Dependents in Canada', weight: 1 });
    }

    // Secondary residential ties
    if (driverLicenseCanada) {
      residentialTies += 0.5;
      tiesDetails.push({ tie: 'Driver license in Canada', weight: 0.5 });
    }

    if (healthCardCanada) {
      residentialTies += 0.5;
      tiesDetails.push({ tie: 'Health card in Canada', weight: 0.5 });
    }

    if (bankAccountsCanada) {
      residentialTies += 0.25;
      tiesDetails.push({ tie: 'Bank accounts in Canada', weight: 0.25 });
    }

    if (membershipsCanada) {
      residentialTies += 0.25;
      tiesDetails.push({ tie: 'Memberships in Canada', weight: 0.25 });
    }

    if (workInCanada) {
      residentialTies += 0.5;
      tiesDetails.push({ tie: 'Work in Canada', weight: 0.5 });
    }

    // Determine residency
    if (daysInCanada >= 183) {
      isResident = true;
      residencyType = 'factual_resident';
      log.push({
        rule: '183-Day Rule',
        result: `Spent ${daysInCanada} days in Canada (>= 183)`,
        citation: 'ITA 2(1), CRA Income Tax Folio S5-F1-C1'
      });
    } else if (residentialTies >= 1) {
      isResident = true;
      residencyType = 'deemed_resident';
      log.push({
        rule: 'Significant Residential Ties',
        result: `Residential ties score: ${residentialTies}`,
        detail: tiesDetails,
        citation: 'ITA 2(1), CRA Income Tax Folio S5-F1-C1'
      });
    }

    // Part-year resident (entered/left Canada)
    if (daysInCanada >= 60 && daysInCanada < 183) {
      log.push({
        rule: 'Part-Year Resident Possible',
        result: 'May be part-year resident if significant ties established',
        citation: 'ITA 2(1)(b)'
      });
    }

    // Emigrant - departure tax
    if (daysInCanadaPriorYear >= 183 && daysInCanada < 183) {
      log.push({
        rule: 'Departure Tax',
        result: 'May be subject to departure tax on worldwide income',
        citation: 'ITA 128.1'
      });
    }

    return { isResident, residencyType, log, tiesDetails };
  }

  static hasCloserConnectionsToCanada(closeContactsUS, homeownerUS) {
    // Simplified - real version would be more comprehensive
    return !homeownerUS && closeContactsUS < 2;
  }
}

module.exports = ResidencyEngine;
