const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const currentDay = new Date().getDate()

function getYear () {
  return currentYear
}

function getMonth () {
  let month = currentDay <= 25 ? currentMonth : currentMonth + 1
  month = month > 12 ? 12 : month
  return month
}

function getDateString (year, month, day) {
  return year + '-' + (month < 10 ? (0 + '' + month) : month) + '-' + (day < 10 ? (0 + '' + day) : day)
}

export default {
  /**
   * 获取账期起始日期
   * @returns {string}
   */
  getBeginDate () {
    let year = getYear()
    let month = getMonth() === 1 ? 1 : getMonth() - 1
    let day = month === 1 ? 1 : 26
    return getDateString(year, month, day)
  },

  /**
   * 获取账期结束日期
   * @returns {string}
   */
  getEndDate () {
    let year = getYear()
    let month = getMonth()
    let day = month === 12 ? 31 : 25
    return getDateString(year, month, day)
  },

  /**
   * 获取当前账期日期
   * @returns {string}
   */
  getCurrentDate () {
    let year = getYear()
    let month = getMonth()
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
