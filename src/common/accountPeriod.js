const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const currentDay = new Date().getDate()

export default {
  /**
   * 获取账期起始日期
   * @returns {string}
   */
  getBeginDate () {
    let month = currentMonth === 1 ? currentMonth : (currentDay <= 25 ? currentMonth - 1 : currentMonth)
    month = month === 12 ? 11 : month
    let day = (currentMonth === 1 && currentDay <= 25) ? 1 : 26
    return currentYear + '-' + (month < 10 ? 0 + '' + month : month) + '-' + (day < 10 ? 0 + '' + day : day)
  },

  /**
   * 获取账期结束日期
   * @returns {string}
   */
  getEndDate () {
    return currentYear + '-' + this.getCurrentMonth() + '-' + (this.getCurrentMonth() === 12 ? 31 : 25)
  },

  /**
   * 获取当前账期日期
   * @returns {string}
   */
  getCurrentDate () {
    return currentYear + '-' + (currentMonth < 10 ? 0 + '' + currentMonth : currentMonth) + '-' + (currentDay < 10 ? 0 + '' + currentDay : currentDay)
  },

  /**
   * 获取当前账期月份
   * @returns {number}
   */
  getCurrentMonth () {
    let month = currentMonth === 1 ? currentMonth : (currentDay <= 25 ? currentMonth : currentMonth + 1)
    month = month > 12 ? 12 : month
    return month
  },

  /**
   * 获取当前日期距离当前账期天数
   * @returns {number}
   */
  getSurplusDays () {
    let currentDate = new Date().getTime()
    let periodDate = new Date(this.getEndDate()).getTime()
    return parseInt((periodDate - currentDate) / 1000 / 60 / 60 / 24) + 1
  }
}
