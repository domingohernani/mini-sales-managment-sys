import type { FastifyRequest, FastifyReply } from "fastify";
import * as jose from "jose";
import { PUBLIC_PEM } from "../constants/auth.constant.ts";

export const verifyJWT = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const accessToken = request.cookies?.accessToken;

  if (!accessToken) {
    return reply.status(401).send({ code: "ACCESS_TOKEN_EXPIRED" });
  }

  if (!PUBLIC_PEM) {
    return reply.status(500).send({ error: "Server configuration error" });
  }

  try {
    const publicKey = await jose.importSPKI(PUBLIC_PEM, "RS256");
    const { payload } = await jose.jwtVerify(accessToken, publicKey);

    request.user = payload;
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      return reply.status(401).send({ code: "ACCESS_TOKEN_EXPIRED" });
    }
    return reply.status(403).send({ message: "Invalid access token" });
  }
};
