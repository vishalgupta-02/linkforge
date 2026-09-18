import "dotenv/config";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "re_mock_api_key_for_testing";

export const resend = new Resend(apiKey);
