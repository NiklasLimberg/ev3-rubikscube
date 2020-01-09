export default {
    vue: {
        config: {
            productionTip: false,
            devtools: true
        }
    },
    build: {
        extend(config, ctx) {
            if (ctx.isDev) {
                config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
            }
        }
    }
    // other configs
}