import BaseAdapterMomentJalaali from '@date-io/jalaali';
import defaultMoment, { LongDateFormatKey } from 'moment-jalaali';
import { MuiFormatTokenMap, MuiPickerFieldAdapter } from '../internals/models';

// From https://momentjs.com/docs/#/displaying/format/
const formatTokenMap: MuiFormatTokenMap = {
  // Month
  jM: 'month',
  jMo: 'month',
  jMM: 'month',
  jMMM: { sectionName: 'month', contentType: 'letter' },
  jMMMM: { sectionName: 'month', contentType: 'letter' },

  // Day of Month
  jD: 'day',
  jDo: 'day',
  jDD: 'day',

  // Year
  jY: 'year',
  jYY: 'year',
  jYYYY: 'year',
  jYYYYYY: 'year',

  // AM / PM
  A: 'meridiem',
  a: 'meridiem',

  // Hour
  H: 'hour',
  HH: 'hour',
  h: 'hour',
  hh: 'hour',
  k: 'hour',
  kk: 'hour',

  // Minute
  m: 'minute',
  mm: 'minute',

  // Second
  s: 'second',
  ss: 'second',
};

export class AdapterMomentJalaali
  extends BaseAdapterMomentJalaali
  implements MuiPickerFieldAdapter<defaultMoment.Moment>
{
  public formatTokenMap = formatTokenMap;

  /**
   * The current getFormatHelperText method uses an outdated format parsing logic.
   * We should use this one in the future to support all localized formats.
   */
  public expandFormat = (format: string) => {
    // @see https://github.com/moment/moment/blob/develop/src/lib/format/format.js#L6
    const localFormattingTokens = /(\[[^[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})|./g;

    return format
      .match(localFormattingTokens)!
      .map((token) => {
        const firstCharacter = token[0];
        if (firstCharacter === 'L' || firstCharacter === ';') {
          return this.moment
            .localeData(this.getCurrentLocaleCode())
            .longDateFormat(token as LongDateFormatKey);
        }

        return token;
      })
      .join('')
      .replace('dd', 'jDD'); // Fix for https://github.com/dmtrKovalenko/date-io/pull/632;
  };

  // Redefined here just to show how it can be written using expandFormat
  public getFormatHelperText = (format: string) => {
    return this.expandFormat(format)
      .replace(/a/gi, '(a|p)m')
      .replace('jY', 'Y')
      .replace('jM', 'M')
      .replace('jD', 'D')
      .toLocaleLowerCase();
  };
}