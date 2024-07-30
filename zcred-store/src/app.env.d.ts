declare module NodeJS {
  type ProcessEnv = {
    PROTOCOL: string;
    HOST: string;
    PORT: string;
    PATH_TO_EXPOSE_DOMAIN: string;
    FRONTEND_ORIGINS: string;
    SECRET_STRING: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
  }
}
