// 该文件定义的常量将被 webpack.DefinePlugin 使用
// 注意 custom-tyings.d.ts 文件的类型定义要与该文件一致
// 参数 dev 表示是否为开发环境

module.exports = dev => ({
  // 是否打印 AI 的日志
  'DEV.LOG_AI': dev,
  // 是否启用 console.assert
  'DEV.ASSERT': dev,
  // 是否显示 <SpotGraph />
  'DEV.SPOT_GRAPH': false,
  // 是否显示 <TankPath />
  'DEV.TANK_PATH': dev,
  // 是否显示 <RestrictedAreaLayer />
  'DEV.RESTRICTED_AREA': dev,
  // 是否加快游戏过程
  'DEV.FAST': dev,
  // 是否使用测试关卡
  'DEV.TEST_STAGE': false,
  // 是否显示 build 信息
  'DEV.HIDE_BUILD_INFO': dev,
  // 是否启用 <Inspector />
  'DEV.INSPECTOR': false,
  // 是否将 AI 坦克同时出现的最大数量设置为 1
  'DEV.SINGLE_AI_TANK': dev,
  // 是否打印游戏日志
  'DEV.LOG': dev,
  // 是否跳过关卡选择
  'DEV.SKIP_CHOOSE_STAGE': false,
})
