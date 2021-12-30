import { Dict, Pluralizer } from "./typing";
import { I18n } from "./I18n";

/**
 * The default pluralizer.
 *
 * It's pretty straightforward:
 *
 * - when count is `0`, then the possible keys are
 * either `zero` for `other`; this allows having translations like
 * "You have no messages", defaulting to "You have 0 messages".
 * - when count is `1`, then the key is `one`.
 * - when greater than `1`, then the key is `other`.
 *
 * @type {Pluralizer}
 *
 * @param {I18n} _i18n The I18n's instance.
 *
 * @param {number} count The number that's being analyzed.
 *
 * @returns {string[]} The list of possible translation scopes.
 */
export const defaultPluralizer: Pluralizer = (
  _i18n: I18n,
  count: number,
): string[] => {
  switch (count) {
    case 0:
      return ["zero", "other"];
    case 1:
      return ["one"];
    default:
      return ["other"];
  }
};

/**
 * This class enables registering different strategies for pluralization, as
 * well as getting a pluralized translation.
 *
 * The default pluralization strategy is based on three counters:
 *
 * - `one`: returned when count is equal to absolute `1`.
 * - `zero`: returned when count is equal to `0`. If this translation is not
 * set, then it defaults to `other`.
 * - `other`: returned when count is different than absolute `1`.
 *
 * When calling `i18n.translate` (or its alias), pluralization rules will be
 * triggered whenever the translation options contain `count`.
 *
 * @example
 * A JSON describing the pluralization rules.
 *
 * ```json
 * {
 *   "en": {
 *     "inbox": {
 *       "zero": "You have no messages",
 *       "one": "You have one message",
 *       "other": "You have %{count} messages"
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * How to get pluralized translations.
 *
 * ```js
 * i18n.t("inbox", {count: 0}); // returns "You have no messages"
 * i18n.t("inbox", {count: 1}); // returns "You have on message"
 * i18n.t("inbox", {count: 2}); // returns "You have 2 messages"
 * ```
 */
export class Pluralization {
  private i18n: I18n;
  private registry: Dict;

  constructor(i18n: I18n) {
    this.i18n = i18n;
    this.registry = {};

    this.register("default", defaultPluralizer);
  }

  /**
   * Register a new pluralizer strategy.
   *
   * You may want to support different pluralization rules based on the locales
   * you have to support. If you do, make sure you submit a pull request at
   * <https://github.com/fnando/i18n> so we can distribute it. For now only
   * Russian is distributed.
   *
   * The pluralizer will receive the `I18n` instance, together with `count`.
   * Is up to the pluralizer to return a list of possible keys given that count.
   * The Russian pluralizer, for instance, returns `one`, `few`, `many`, `other`
   * as possible pluralization keys.
   *
   * You can view a complete list of pluralization rules at
   * [unicode.org](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html).
   *
   * @param {string} locale The locale.
   *
   * @param {Pluralizer} pluralizer The pluralizer function.
   *
   * @returns {void}
   */
  public register(locale: string, pluralizer: Pluralizer): void {
    this.registry[locale] = pluralizer;
  }

  /**
   * Returns a list of possible pluralization keys.
   * This is defined by a chain of pluralizers, going from locale set
   * explicitly, then the locale set through `i18n.locale`, defaulting to
   * `defaultPluralizer`.
   *
   * @param  {string} locale The locale.
   *
   * @returns {Pluralizer} The pluralizer function.
   */
  public get(locale: string): Pluralizer {
    return (
      this.registry[locale] ||
      this.registry[this.i18n.locale] ||
      this.registry["default"]
    );
  }
}
