import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  { ignores: [".next/**", ".next-dev/**", ".next-dev-*/**", "node_modules/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
];

export default eslintConfig;
