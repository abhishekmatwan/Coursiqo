const { Resend } = require("resend");

const mailSender = async (email, title, body) => {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const info = await resend.emails.send({
            from: "Coursiqo <onboarding@resend.dev>",
            to: email,
            subject: title,
            html: body,
        });
        console.log(info);
        return info;
    } catch (error) {
        console.log(error.message);
        return error;
    }
}

module.exports = mailSender;