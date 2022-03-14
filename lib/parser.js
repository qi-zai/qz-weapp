module.exports = {
  tpl: (file) => {
    file.path = file.path.replace('.vue', '.wxml')

    String(file.contents).match(RegExp('<template>([\\s\\S]*)<\\/template>'))

    let ctx = RegExp.$1.replace(/\n\s{2}/g, '\n').trim()
      .replace(/v-for="([^\s\)]+)\s+in\s+(\S+)"/g, 'wx:for="{{$1}}" wx:for-item="$2"')
      .replace(/v-for="\((.*),(.*)\)\s+in\s+(\S+)"/g, 'wx:for="{{$1}}" wx:for-index="$2" wx:for-item="$3"')
      .replace(/v-if="(.*)"/g, 'wx:if="{{$1}}"')
      .replace(/v-else-if="(.*)"/g, 'wx:elif="{{$1}}"')
      .replace(/v-else([\s>])/g, 'wx:else$1')
      .replace(/v-show="(.+)"/g, 'hidden="{{!$1}}"')
      .replace(/v-model="(.+)"/g, 'value="{{$1}}"')
      .replace(/\s+@click="/g, ' bindtap="')
      .replace(/\s+@click.stop="/g, ' catchtap="')
      .replace(/\s+:key="/g, ' wx:key="')
      .replace(/\s+@([a-zA-Z]+)="/g, ' bind$1="')

    file.contents = Buffer.from(ctx)
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

  js: (file, options) => {
    const isComp = file.path.includes('/components/')
    file.path = file.path.replace('.vue', '.js')

    String(file.contents).match(RegExp('<script.*>([\\s\\S]*?)<\\/script>'))
    let ctx = RegExp.$1.trim().replace(/;$/, '')

    if (isComp) {
      ctx = ctx.replace(/props\s*:\s*{/, 'properties:{')
    } else if (ctx.includes('methods:')) {
      ctx = ctx.replace(/methods:\s*\{/, '').replace(/\},{0,1}(\s*\n)*?.*\}$/, '\n}')
    }

    let path, pathMap = {}, usingComponents = {}
    while ((path = ctx.match(/import\s+?(.*)\s+?from\s*?['|"](.*?)\.vue['|"];*/))) {
      ctx = ctx.replace(path[0], '')
      pathMap[path[1]] = path[2]
    }
    const comp = ctx.match(/components\s*?:\s*?{(.*)}\s*?,{0,1}/)
    if (comp) {
      ctx = ctx.replace(comp[0], '')
      for (const v of comp[1].split(',')) {
        const k = v.trim()
        usingComponents[k] = pathMap[k]
      }
      options.componentsMappers[file.path + 'on'] = usingComponents
    }

    file.contents = Buffer.from(`${ctx.replace(/export\s+default\s*/, isComp ? `Component(,` : 'Page(')})`)
  },

  handleAppJSON(file) {
    if (file.path.endsWith('/src/page.config.js')) {
      this.pages = Object.values(new Function(String(file.contents).replace(/export\s+default/, 'return '))())
    } else if (file.path.endsWith('/src/app.json')) {
      file.contents = Buffer.from(JSON.stringify({ pages: this.pages, ...JSON.parse(String(file.contents)) }))
    }
  },

  handleComponents(file, options) {
    if (options.componentsMappers[file.path]) {
      file.contents = Buffer.from(JSON.stringify({ usingComponents: options.componentsMappers[file.path], ...JSON.parse(String(file.contents)) }))
    }
  }
}