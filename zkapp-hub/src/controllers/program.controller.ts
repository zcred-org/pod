import { AppContext } from "../app.js";
import { Injector } from "typed-inject";
import { JalProgram } from "@jaljs/core";

export function ProgramController(context: Injector<AppContext>) {
  const config = context.resolve("config");
  const fastify = context.resolve("httpServer").fastify;
  const programService = context.resolve("programService");

  fastify.route<{ Body: { program: JalProgram } }>({
    method: "POST",
    url: `/api/v1/program`,
    handler: async ({ body }) => {
      const { id } = await programService.findOrCreateFrom(body.program);
      const programURL = new URL(`/api/v1/program/${id}.js`, config.exposeDomain);
      return {
        id: id,
        url: programURL.href
      };
    }
  });

  fastify.route<{ Params: { id: string } }>({
    method: "GET",
    url: `/api/v1/program/:id.js`,
    handler: async ({ params }, resp) => {
      const found = await programService.findOneOrNull({ id: params.id });
      if (!found) {
        resp.statusCode = 400;
        resp.send({ message: `Can not find program by id: ${params.id}` });
      } else {
        resp.header("Content-Type", "text/javascript");
        resp.statusCode = 200;
        resp.send(found.data);
      }
    }
  });

  fastify.route<{ Params: { id: string } }>({
    method: "GET",
    url: "/api/v1/program/:id",
    handler: async ({ params }, resp) => {
      const found = await programService.findOneOrNull({ id: params.id });
      if (found) return found;
      resp.statusCode = 400;
      return { message: `Can not find program by id: ${params.id}` };
    }
  });
}