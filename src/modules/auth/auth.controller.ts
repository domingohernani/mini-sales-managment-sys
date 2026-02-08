import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import * as jose from "jose";
import bcrypt from "bcrypt";
import { authUserSchema, type AuthUser } from "./schema/auth.schema.ts";
import {
  PRIVATE_PEM,
  PUBLIC_PEM,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  ACCESS_TOKEN_EXPIRATION_MS,
  REFRESH_TOKEN_EXPIRATION_MS,
} from "../../common/constants/auth.constant.ts";

/**
 * Authenticates a user with email and password.
 * Verifies password using bcrypt and generates access and refresh tokens.
 * Tokens are stored in HTTP-only cookies.
 * Returns 400 if validation fails, 401 if credentials invalid, 500 if server configuration error.
 */
export const authenticate = async (
  request: FastifyRequest<{ Body: AuthUser }>,
  reply: FastifyReply,
) => {
  const { email, password } = authUserSchema.parse(request.body);

  if (!PRIVATE_PEM) {
    return reply.status(500).send({
      error: "Server configuration error",
    });
  }

  try {
    const { rows } = await request.server.pg.query(
      "SELECT id, first_name, last_name, email, password FROM users WHERE email = $1",
      [email],
    );
    const user = rows[0];

    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    // Remove password
    const { password: _, ...userWithoutPassword } = user;

    const privateKey = await jose.importPKCS8(PRIVATE_PEM, "RS256");

    // Access token (short exp date)
    const accessToken = await new jose.SignJWT(userWithoutPassword)
      .setProtectedHeader({ alg: "RS256" })
      .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
      .sign(privateKey);

    const refreshToken = await new jose.SignJWT(userWithoutPassword)
      .setProtectedHeader({ alg: "RS256" })
      .setExpirationTime(REFRESH_TOKEN_EXPIRATION)
      .sign(privateKey);

    reply.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: ACCESS_TOKEN_EXPIRATION_MS,
    });

    reply.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: REFRESH_TOKEN_EXPIRATION_MS,
    });

    return { user: userWithoutPassword };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Refreshes the access token using a valid refresh token from cookies.
 * Verifies the refresh token and generates a new access token.
 * Returns 401 if no refresh token found, 400 if validation fails,
 * 500 if server configuration error.
 */
export const refresh = async (request: FastifyRequest, reply: FastifyReply) => {
  const refreshToken = request.cookies?.refreshToken;

  // Early returns
  if (!refreshToken) {
    return reply.status(401).send({ message: "No refresh token found" });
  }

  if (!PUBLIC_PEM || !PRIVATE_PEM) {
    return reply.status(500).send({
      error: "Server configuration error",
    });
  }

  try {
    const publicKey = await jose.importSPKI(PUBLIC_PEM, "RS256");

    const { payload: user } = await jose.jwtVerify(refreshToken, publicKey);

    const privateKey = await jose.importPKCS8(PRIVATE_PEM, "RS256");

    const accessToken = await new jose.SignJWT(user)
      .setProtectedHeader({ alg: "RS256" })
      .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
      .sign(privateKey);

    // Setting cookies as httpOnly (not accessible by JavaScript)
    reply.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: ACCESS_TOKEN_EXPIRATION_MS,
    });
    return reply.send({ message: "New access token created" });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};
