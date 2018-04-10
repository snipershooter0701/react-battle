import React from 'react'
import { Route, Switch } from 'react-router-dom'

const AboutGallery = () => (
  <div>
    <p>请使用鼠标操作该页面。</p>
  </div>
)

const AboutList = () => (
  <div>
    <p>请使用鼠标操作该页面。切换分页时会有卡顿现象，请耐心等待。</p>
    <p>自定义关卡数据会保存在浏览器缓存中。</p>
  </div>
)

const AboutEditor = () => (
  <div>
    <p>请使用鼠标操作该页面。</p>
    <p>在 config tab 中配置关卡的名称和敌人，注意关卡名称不能和游戏自带关卡的名称相同。</p>
    <p>
      在 map tab
      中配置关卡地图，选定一种画笔之后，在地图中按下鼠标并拖拽，来完成地图配置。brick-wall 和
      steel-wall 的形状可以进行调整。
    </p>
  </div>
)

const AboutGame = () => (
  <div>
    <p className="bold">WASD 控制坦克方向</p>
    <p className="bold">J 控制开火</p>
    <p className="bold">ESC 暂停游戏</p>
    <p>后退以返回关卡选择页面</p>
  </div>
)

const AboutChoose = () => (
  <div>
    <p className="bold">A 上一个关卡</p>
    <p className="bold">D 下一个关卡</p>
    <p className="bold">J 开始游戏</p>
    <p>该页面也支持鼠标控制</p>
  </div>
)

const AboutTitle = () => (
  <div>
    <p>
      目前只支持单人进行游戏。请使用最新的 chrome 浏览器，并适当调整浏览器的缩放比例（1080P 下设置为
      200% 缩放），以获得最好的游戏体验。
    </p>
    <p className="bold">W 上一个选项</p>
    <p className="bold">S 下一个选项</p>
    <p className="bold">J 确定</p>
    <p>该页面也支持鼠标控制</p>
  </div>
)

export default () => (
  <div className="about">
    <p>
      当前版本 <br />
      {COMPILE_VERSION}
    </p>
    <p>
      编译时间 <br />
      {COMPILE_DATE}
    </p>
    <Switch>
      <Route path="/list" render={AboutList} />
      <Route path="/editor" render={AboutEditor} />
      <Route path="/gallery" render={AboutGallery} />
      <Route exact path="/gameover" render={AboutGame} />
      <Route path="/choose" render={AboutChoose} />
      <Route path="/stage" render={AboutGame} />
      <Route render={AboutTitle} />
    </Switch>
  </div>
)
