const tplReplaceRules = {
  '@click': 'bindtap',
  '@click.stop': 'catchtap',
  ':key': 'wx:key',
  'v-for'(ctx) {
    return ctx
      .replace(/v-for="([^\s\)]+)\s+in\s+(\S+)"/g, 'wx:for="{{$1}}" wx:for-item="$2"')
      .replace(/v-for="\((.*),(.*)\)\s+in\s+(\S+)"/g, 'wx:for="{{$1}}" wx:for-index="$2" wx:for-item="$3"')
  },
  'v-if'(ctx) {
    return ctx.replace(/v-if="(.*)"/g,'wx:if="{{$1}}"')
  },
  'v-else-if'(ctx) {
    return ctx.replace(/v-else-if="(.*)"/g,'wx:elif="{{$1}}"')
  },
  'v-else'(ctx) {
    return ctx.replace(/v-else([\s>])/g,'wx:else$1')
  },
  // `v-bind:src` | `src`
  // `href` | `url`
  // `v-on:click` | `bindtap`
  // `(click)` | `bindtap`
  // `@touchstart` | `bindtouchstart`
  // `@touchmove` | `bindtouchmove`
  // `@touchend` | `bindtouchend`
  // `:key` | 
  // `v-show` | `hidden="{{! }}"`
  // `v-model` | `value="{{  }}" bind:input=" Changed"`
}

module.exports = {
  tpl: (file) => {
    file.path = file.path.replace('.vue', '.wxml')
    
    String(file.contents).match(RegExp('<template>([\\s\\S]*)<\\/template>'))
    let ctx = RegExp.$1.replace(/\n\s{2}/g,'\n').trim()
    for (const k in tplReplaceRules){
      if (typeof tplReplaceRules[k] === 'function') {
        ctx = tplReplaceRules[k](ctx)
      } else {
        ctx = ctx.replaceAll(k,tplReplaceRules[k])
      }
    }

    file.contents = Buffer.from(ctx)
  },

  style: (file) => {
    file.path = file.path.replace('.vue', '.wxss')

    String(file.contents).match(RegExp('<style.*>([\\s\\S]*)<\\/style>'))

    file.contents = Buffer.from(RegExp.$1.trim())
  },

  js: (file) => {
    file.path = file.path.replace('.vue', '.js')

    String(file.contents).match(RegExp('<script.*>([\\s\\S]*?)<\\/script>'))
    let ctx = RegExp.$1.trim()

    file.contents = Buffer.from(`${ctx.replace(/export\s+default\s*/,'Page(')})`)
  },
}