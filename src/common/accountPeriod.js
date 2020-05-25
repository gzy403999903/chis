const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const currentDay = new Date().getDate()

function getDateString (year, month, day) {
  return year + '-' + (month < 10 ? (0 + '' + month) : month) + '-' + (day < 10 ? (0 + '' + day) : day)
}

export default {
  /**
   * 获取年度
   * @returns {number}
   */
  getYear () {
    return currentYear
  },

  /**
   * 获取月度
   * @returns {number}
   */
  getMonth () {
    let month = currentDay <= 25 ? currentMonth : currentMonth + 1
    month = month > 12 ? 12 : month
    return month
  },

  /**
   * 获取账期起始日期
   * @returns {string}
   */
  getBeginDate () {
    let year = this.getYear()
    let month = this.getMonth() === 1 ? 1 : this.getMonth() - 1
    let day = month === 1 ? 1 : 26
    return getDateString(year, month, day)
  },

  /**
   * 获取账期结束日期
   * @returns {string}
   */
  getEndDate () {
    let year = this.getYear()
    let month = this.getMonth()
    let day = month === 12 ? 31 : 25
    return getDateString(year, month, day)
  },

  /**
   * 获取当前账期日期
   * @returns {string}
   */
  getCurrentDate () {
    let year = this.getYear()
    let month = this.getMonth()
    return getDateString(year, month, currentDay)
  },

  /**
   * 获取当前日期距离当前账期天数
   * @returns {number}
   */
  getSurplusDays () {
    let currentDate = new Date(this.getCurrentDate()).getTime()
    let periodDate = new Date(this.getEndDate()).getTime()
    return parseInt((periodDate - currentDate) / 1000 / 60 / 60 / 24) + 1
  }
}
