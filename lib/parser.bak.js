const htmlparser2 = require('htmlparser2');
const domSerializer = require('dom-serializer').default;

const replaceRules = {
  'v-for'(value){
    if (/\((.+?),(.+?)\)\s+?in\s+(\S+)/.test(value)) {
      this['wx:for'] = `{{${RegExp.$3}}}`
      this['wx:for-index'] = RegExp.$2
      this['wx:for-item'] = RegExp.$1
    }else if(/(\S+)\s+in\s(\S+)/.test(value)) {
      this['wx:for'] = `{{${RegExp.$2}}}`
      this['wx:for-item'] = RegExp.$1
    }
  },
  'v-else-if'(value){
    this['wx:elif'] = `{{${value}}}`
  },
  'v-model'(value){
    this['value'] = `{{${value}}}`
  },
  'v-show'(value){
    this['hidden'] = `{{!${value}}}`
  },
  '@click'(value){
    this['bindtap'] = value
  },
  '@click.stop'(value){
    this['catchtap'] = value
  },
  '@click.stop'(value){
    this['catchtap'] = value
  },
}

function handlerNodeAttrs (attrs) {
  if (!attrs) return null

  const _attrs = {}
  for(const k in attrs) {
    if (replaceRules[k]) {
      replaceRules[k].call(_attrs,attrs[k])
    } else {
      _attrs[
        k.replace(/^(v-|:)/,'wx:')
         .replace(/^@/,'bind')
      ] = attrs[k]
    }
  }
  return _attrs
}

function handleNode (node) {
  if (!node) return

  if (node.children && node.children.length) {
    for(const n of node.children) handleNode(n)
  }

  node.attribs = handlerNodeAttrs(node.attribs)
  if (node.name === 'template') node.name = 'block'

  if(node.name=='input') console.log(node)

  return node
}

module.exports = {
  tpl: (file) => {
    file.path = file.path.replace('.vue', '.wxml')

    String(file.contents).match(RegExp('<template>([\\s\\S]*)<\\/template>'))

    const domHandler = new htmlparser2.DomHandler();
     new htmlparser2.Parser(domHandler, {
      xmlMode: true,
      lowerCaseAttributeNames: false,
      recognizeSelfClosing: true,
      lowerCaseTags: false
    }).end(RegExp.$1.replace(/\n\s{2}/g, '\n').trim());

    file.contents = Buffer.from(domSerializer(handleNode(domHandler.root),{decodeEntities:false}))
  },

  style: (file) => {
    file.path = file.path.replace('.vue', '.scss')
    String(file.contents).match(RegExp('<style.*>([\\s\\S]*)<\\/style>'))
    file.contents = Buffer.from(RegExp.$1.trim())
  },

  css2wxss: (file) => {
    file.path = file.path.replace('.css', '.wxss')
    file.contents = Buffer.from(String(file.contents).replace(/(\d+)px/g, '$1rpx'))
  },

  js: (file) => {
    file.path = file.path.replace('.vue', '.js')
    String(file.contents).match(RegExp('<script.*>([\\s\\S]*?)<\\/script>'))
    let ctx = RegExp.$1.trim()
    if (ctx.includes('methods:')) {
      ctx = ctx.replace(/methods:\s*\{/, '').replace(/\},{0,1}(\s*\n)*?.*\}$/, '\n}')
    }
    file.contents = Buffer.from(`${ctx.replace(/export\s+default\s*/, 'Page(')})`)
  },

  handleAppJSON(file) {
    if (file.path.endsWith('/src/page.config.js')) {
      this.pages = Object.values(new Function(String(file.contents).replace(/export\s+default/, 'return '))())
    } else if (file.path.endsWith('/src/app.json')) {
      file.contents = Buffer.from(JSON.stringify({ pages: this.pages, ...JSON.parse(String(file.contents)) }))
    }
  }
}