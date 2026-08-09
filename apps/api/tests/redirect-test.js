import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    redirect_spike: {
      executor: "constant-vus",
      vus: 500,
      duration: "30s",
    },
  },
};

export default function () {
  const response = http.get(
    "http://localhost:5000/api/v1/redirect/85e821ba-f5bf-4f60-9f40-0e1a7661326b",
    {
      redirects: 0,
    },
  );

  check(response, {
    "is redirect": (r) => r.status === 302,
  });
}
