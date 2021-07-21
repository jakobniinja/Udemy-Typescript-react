import axios from 'axios';
import * as esbuild from 'esbuild-wasm';
import localforage from 'localforage';


const fileCacha = localforage.createInstance({
    name: "filecache"
});



export const unpkgPathPlugin = (inputCode: string) => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {

            // handle root entry fole of index.js

            build.onResolve({ filter: /(^index\.js$)/ }, () => {
                return { path: "index.js", namespace: "a" }
            })


            // handle relative path in a module 

            build.onResolve({ filter: /^\.+\// }, (args: any) => {
                return {
                    namespace: "a",
                    path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/").href,
                }

            })

            // handle main file of a module

            build.onResolve({ filter: /.*/ }, async (args: any) => {

                return {
                    namespace: "a",
                    path: `https://unpkg.com/${args.path}`
                }
            });


            build.onLoad({ filter: /.*/ }, async (args: any) => {
                console.log('onLoad', args);

                if (args.path === 'index.js') {
                    return {
                        loader: 'jsx',
                        contents: inputCode,
                    };
                }

                const cachedResult = await fileCacha.getItem<esbuild.OnLoadResult>(args.path)

                if (cachedResult) {
                    return cachedResult
                }

                const { data, request } = await axios.get(args.path)

                const result: esbuild.OnLoadResult = {
                    loader: "jsx",
                    contents: data,
                    resolveDir: new URL("./", request.responseURL).pathname
                }
                await fileCacha.setItem(args.path, result)

                return result

            });
        },
    };
};
