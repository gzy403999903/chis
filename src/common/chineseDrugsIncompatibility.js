/**
 * 中药 十八反十九畏
 * @param drugs
 * @param drugsArray
 * @returns {*}
 */
export function getIncompatibility (drugs, drugsArray) {
  checkArgs(drugs, drugsArray) // 检查参数
  drugs = drugs.trim()

  // 甘草 反 甘遂、京大戟、海藻、芫花
  let gancao = ['甘草']
  let gancaoFan = ['甘遂', '京大戟', '海藻', '芫花']
  if (matchIncompatibility([drugs], gancao)) {
    return matchIncompatibility(drugsArray, gancaoFan)
  }
  if (matchIncompatibility([drugs], gancaoFan)) {
    return matchIncompatibility(drugsArray, gancao)
  }

  // 川乌、附子、草乌、黑顺片 反 川贝、浙贝、全瓜蒌、瓜蒌皮、瓜蒌仁、天花粉、半夏、白蔹、白芨
  let wutou = ['川乌', '附子', '草乌', '黑顺片']
  let wutouFan = ['川贝', '浙贝', '瓜蒌', '天花粉', '半夏', '白蔹', '白芨']
  if (matchIncompatibility([drugs], wutou)) {
    return matchIncompatibility(drugsArray, wutouFan)
  }
  if (matchIncompatibility([drugs], wutouFan)) {
    return matchIncompatibility(drugsArray, wutou)
  }

  // 藜芦 反 人参、沙参、丹参、玄参、苦参、细辛、赤芍、白芍
  let lilu = ['藜芦']
  let liluFan = ['人参', '沙参', '丹参', '玄参', '苦参', '细辛', '赤芍', '白芍']
  if (matchIncompatibility([drugs], lilu)) {
    return matchIncompatibility(drugsArray, liluFan)
  }
  if (matchIncompatibility([drugs], liluFan)) {
    return matchIncompatibility(drugsArray, lilu)
  }

  // 硫黄 畏 朴硝
  if (drugs.indexOf('硫黄') !== -1) {
    return matchIncompatibility(drugsArray, ['朴硝'])
  }
  if (drugs.indexOf('朴硝') !== -1) {
    return matchIncompatibility(drugsArray, ['硫黄'])
  }

  // 水银 畏 砒霜
  if (drugs.indexOf('水银') !== -1) {
    return matchIncompatibility(drugsArray, ['砒霜'])
  }
  if (drugs.indexOf('砒霜') !== -1) {
    return matchIncompatibility(drugsArray, ['水银'])
  }

  // 狼毒 畏 密陀僧
  if (drugs.indexOf('狼毒') !== -1) {
    return matchIncompatibility(drugsArray, ['密陀僧'])
  }
  if (drugs.indexOf('密陀僧') !== -1) {
    return matchIncompatibility(drugsArray, ['狼毒'])
  }

  // 巴豆 畏 牵牛
  if (drugs.indexOf('巴豆') !== -1) {
    return matchIncompatibility(drugsArray, ['牵牛'])
  }
  if (drugs.indexOf('牵牛') !== -1) {
    return matchIncompatibility(drugsArray, ['巴豆'])
  }

  // 丁香 畏 郁金
  if (drugs.indexOf('丁香') !== -1) {
    return matchIncompatibility(drugsArray, ['郁金'])
  }
  if (drugs.indexOf('郁金') !== -1) {
    return matchIncompatibility(drugsArray, ['丁香'])
  }

  // 川乌 畏 犀角
  if (drugs.indexOf('川乌') !== -1) {
    return matchIncompatibility(drugsArray, ['犀角'])
  }
  if (drugs.indexOf('犀角') !== -1) {
    return matchIncompatibility(drugsArray, ['川乌'])
  }

  // 草乌 畏 犀角
  if (drugs.indexOf('草乌') !== -1) {
    return matchIncompatibility(drugsArray, ['犀角'])
  }
  if (drugs.indexOf('犀角') !== -1) {
    return matchIncompatibility(drugsArray, ['草乌'])
  }

  // 牙硝 畏 三棱
  if (drugs.indexOf('牙硝') !== -1) {
    return matchIncompatibility(drugsArray, ['三棱'])
  }
  if (drugs.indexOf('三棱') !== -1) {
    return matchIncompatibility(drugsArray, ['牙硝'])
  }

  // 官桂 畏 赤石脂
  if (drugs.indexOf('官桂') !== -1) {
    return matchIncompatibility(drugsArray, ['赤石脂'])
  }
  if (drugs.indexOf('赤石脂') !== -1) {
    return matchIncompatibility(drugsArray, ['官桂'])
  }

  // 人参 畏 五灵脂
  if (drugs.indexOf('人参') !== -1) {
    return matchIncompatibility(drugsArray, ['五灵脂'])
  }
  if (drugs.indexOf('五灵脂') !== -1) {
    return matchIncompatibility(drugsArray, ['人参'])
  }

  return null
}

/**
 * 验证参数是否合法
 * @param drugs
 * @param drugsArray
 * @returns {*}
 */
function checkArgs (drugs, drugsArray) {
  // 查看 drugs 是否合法
  if (!drugs || typeof (drugs) !== 'string') {
    throw new Error('drugs 必须是一个字符串类型')
  }

  // 检查 drugsArray 是不是一个数组
  if (!(drugsArray instanceof Array)) {
    throw new Error('drugsArray 必须是一个数组类型')
  }

  // 如果数组为空则返回 false
  if (drugsArray && drugsArray.length === 0) {
    return null
  }
}

/**
 * 匹配 十八反十九畏
 * @param drugsArray
 * @param incompatibilityDrugsArray
 * @returns {*}
 */
function matchIncompatibility (drugsArray, incompatibilityDrugsArray) {
  for (let i = 0; i < drugsArray.length; i++) {
    for (let j = 0; j < incompatibilityDrugsArray.length; j++) {
      if (drugsArray[i].indexOf(incompatibilityDrugsArray[j]) !== -1) {
        return drugsArray[i]
      }
    }
  }
  return null
}
