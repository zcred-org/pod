// import { suite } from "uvu";
// import { JalProgram } from "@jaljs/core";
// import vm from "node:vm";
// import * as o1js from "o1js";
//
// const test = suite("Just test of program");
//
// test("", async () => {
//   const program: JalProgram = {
//     target: "o1js:zk-program.cjs",
//     inputSchema: {
//       private: {
//         one: {
//           type: "setup",
//           transLinks: ["uin64-mina:field"]
//         }
//       },
//       public: {
//         one: {
//           type: "reference",
//           path: ["private", "one"]
//         }
//       }
//     },
//     commands: [
//       {
//         assert: {
//           in: [{
//             type: "function", equal: {
//               in: [
//                 { type: "reference", path: ["private", "one"] },
//                 { type: "reference", path: ["public", "one"] }
//               ]
//             }
//           }]
//         }
//       }
//     ]
//   };
//   const resp = await fetch(new URL("http://localhost:5000/api/v1/program"), {
//     method: "POST",
//     headers: {
//       "Content-type": "application/json"
//     },
//     body: JSON.stringify({ program: program })
//   });
//   console.log("resp status code:", resp.status);
//   const body = await resp.json();
//   console.log("resp body", JSON.stringify(body, null, 2));
//   const { url } = body as { url: string, id: string };
//
//   const programResp = await fetch(url.replace(".js", ""));
//   console.log(await programResp.json());
//
//   const code = await fetchCode(url);
//   // console.log(vm.SourceTextModule);
//   const module = new vm.Script(code).runInThisContext();
//   const { zkProgram, PublicInput } = await module.initialize(o1js);
//   const { verificationKey } = await zkProgram.compile();
//   console.log(verificationKey);
//   const publicInput = new PublicInput({ one: o1js.Field(1) });
//   const proof = await zkProgram.execute(publicInput, o1js.Field(1));
//   const jsonProof = proof.toJSON();
//   const verified = await o1js.verify(jsonProof, verificationKey);
//   console.log(verified);
// });
//
// test.run();
//
// async function fetchCode(url: string | URL) {
//   const targetURL = typeof url === "string" ? new URL(url) : url;
//   const resp = await fetch(targetURL);
//   if (resp.ok) {
//     return await resp.text();
//   }
//   throw new Error(
//     `Error fetching ${url}: ${resp.statusText}`
//   );
// }