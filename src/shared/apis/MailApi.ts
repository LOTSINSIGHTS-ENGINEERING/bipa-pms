import axios from "axios";
import { stringify } from "querystring";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";

export default class MailApi {
  API_URI: string;

  constructor(private api: AppApi, private store: AppStore, URI: string) {
    this.API_URI = URI;
  }

  // Send
  async sendMail(
    to: string[],
    from: string,
    cc: string[],
    subject: string,
    message: string
  ) {
    const body = {
      from: from,
      to: to.join(", "),
      cc: to.join(", "),
      subject,
      message,
    };

    const uri = `${this.API_URI}${stringify(body)}`;
    const response = await axios.get(uri);
    return response;
  }

  async scorecardMail(
    to: string,
    from: string,
    subject: string,
    message: string
  ) {
    const body = {
      from: from,
      to: to,
      subject,
      message,
    };

    const uri = `${this.API_URI}${stringify(body)}`;
    const response = await axios.get(uri);
    return response;
  }

  async sendMailCC(
    to: string[],
    cc: string[],
    from: string,
    subject: string,
    message: string
  ) {
    const body = {
      from: from,
      to: to.join(", "),
      cc: cc.join(", "),
      subject,
      message,
    };

    const uri = `${this.API_URI}${stringify(body)}`;
    const response = await axios.get(uri);
    return response;
  }
  async sendMail1(to: string[], from: string, subject: string, message: string) {
    const body = {
      from: from,
      to: to.join(", "),
      subject,
      message,
    };

    const uri = `${this.API_URI}${new URLSearchParams(body)}`;
    const response = await axios.get(uri);
    return response;
  }

}

export const RESUBMISSION_EMAIL = (
  name: string | null = "",
  recipientEmail: string
) => {
  const MY_SUBJECT = `Resubmission`;
  const MY_BODY = [
    `Dear ${name},`,
    "",
    "Your submission requires resubmission.",
    "",
    "Please review the feedback and submit again.",
    "",
    "Sincerely,",
    "E-Performance System",
  ];

  return {
    MY_SUBJECT: MY_SUBJECT,
    MY_BODY: MY_BODY.join("<br/>"),
  };
};
