const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);
const timezone = 'Asia/Tokyo';
dayjs.tz.setDefault(timezone);

/**
 * 現在時刻を返します。
 * @returns {dayjs.Dayjs} 現在時刻の日付オブジェクト
 */
exports.current = () => dayjs.tz();

/**
 * 現在時刻を「YYYY-MM-DD hh:mm:ss」の文字列で返します。
 * @return {string} 「YYYY-MM-DD HHmmss）の現在時刻
 */
exports.formatCurrent = () => exports.current().format('YYYY-MM-DD HH:mm:ssZ');

/**
 * 指定された日数前の日付を返します。
 * @returns {dayjs.Dayjs} 指定された日数前の日付オブジェクト
 */
exports.daysAgo = (days) => exports.current().subtract(days, "day");

/**
 * 時刻文字列をJSTの日付オブジェクトに変換します。
 * @param time 時刻文字列
 * @param format 時刻文字列のフォーマット。未指定の場合は「YYYY-MM-DDTHH:mm:ssZ'」とする。
 * @returns {dayjs.Dayjs} 指定された時刻文字列の日付オブジェクト
 */
exports.utc2JstDay = (time, format = 'YYYY-MM-DDTHH:mm:ssZ') => dayjs.utc(time, format).tz(timezone);

/**
 * ２つの日付を比較し２つ目が１つ目より前の場合、trueを返します。
 * @param {dayjs.Dayjs} day 比較元の日付
 * @param {dayjs.Dayjs} target 比較先の日付
 * @returns {dayjs.Dayjs} 判定結果。つ目が１つ目より前の場合、trueを返します。それ以外の場合、falseを返します。
 */
exports.isSameOrBefore = (day, target) => day.isSameOrBefore(target);
