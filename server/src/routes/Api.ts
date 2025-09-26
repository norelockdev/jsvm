import express from 'express';
import * as Babel from "@babel/standalone";
import terser from "terser";
import Compiler from "../Compiler/Compiler";

function transpileToEs5(code: string): string {
  return Babel.transform(code, { presets: ['env'] }).code;
}

const apiRouter = express.Router();

const allowedAuthorizationKeys = [
  'debefd54-7f23-475f-9598-5bfe6950033b'
];

const vaildateAuthKey = (header: string): boolean => {
  if (!header || typeof header !== 'string')
    return false;

  const [method, value] = header.split(' ');
  if (method !== 'Basic')
    return false;

  for (let i = 0; i < allowedAuthorizationKeys.length; i++) {
    const key = allowedAuthorizationKeys[i];
    if (key === value)
      return true;
  }

  return false;
};

apiRouter.post('/compile', async (req, res) => {
  // const authHeader = req.headers.authorization ?? null;
  // const vaild = vaildateAuthKey(authHeader);
  // if (!vaild)
  //   return res.status(401).json({error: "invalid authorization key"});

  const { code, is_production } = req.body;
  if (!code) return res.sendStatus(401);

  try {
    const es5Code = transpileToEs5(
      ` (function NORELOCK_JSVM(){
          ${code}
        })()`
    );

    const minifiedCode = await terser.minify(es5Code, {
      compress: {
        defaults: true,
        reduce_funcs: false,
        passes: 10,
      }
    });

    const isProduction = is_production ?? true;
    const finalCode = isProduction ? minifiedCode.code : es5Code;

    const compiler = new Compiler(finalCode, { compress: true });
    compiler.compile().then(code => {
      console.log(compiler.logs.join('\n'));

      return res.json({ code: code[0] });
    })

  } catch (err) {
    return res.status(501).json({ error: ("" + err).slice(0, 200) });
  }
});

export default apiRouter;
