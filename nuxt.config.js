import path from 'path'
import fs from 'fs'

export default {
    server: {
        https: {
            key: fs.readFileSync(path.resolve(__dirname, 'local.key')),
            cert: fs.readFileSync(path.resolve(__dirname, 'local.crt'))
        },
        port: 443,
        host: '0.0.0.0'
    }, build: {
        extend(config, ctx) {
            if (ctx.isDev) {
                config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
            }
        }
    }
    // other configs
}