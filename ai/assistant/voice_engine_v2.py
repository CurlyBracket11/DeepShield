# ============================================================
# DEEPSHIELD-AI — JARVIS-STYLE HINGLISH VOICE ENGINE V2
# ============================================================

import pyttsx3


class JarvisVoiceEngine:

    def __init__(self):

        self.engine = pyttsx3.init()

        # ----------------------------------------------------
        # JARVIS-STYLE VOICE SETTINGS
        # ----------------------------------------------------

        self.engine.setProperty(
            "rate",
            155
        )

        self.engine.setProperty(
            "volume",
            1.0
        )

        self._configure_voice()

    # --------------------------------------------------------
    # Configure Microsoft David
    # --------------------------------------------------------

    def _configure_voice(self):

        voices = self.engine.getProperty(
            "voices"
        )

        for voice in voices:

            voice_text = (
                f"{voice.name} "
                f"{voice.id}"
            ).lower()

            if "david" in voice_text:

                self.engine.setProperty(
                    "voice",
                    voice.id
                )

                break

    # --------------------------------------------------------
    # Speak
    # --------------------------------------------------------

    def speak(
        self,
        text: str
    ):

        if not text:
            return

        print()
        print(
            "DeepShield Assistant:"
        )

        print(
            text
        )

        self.engine.say(
            text
        )

        self.engine.runAndWait()

    # --------------------------------------------------------
    # Stop
    # --------------------------------------------------------

    def stop(self):

        self.engine.stop()


# ============================================================
# VOICE TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — JARVIS VOICE ENGINE V2")
    print("=" * 70)

    voice = JarvisVoiceEngine()

    voice.speak(
        "DeepShield analysis complete. "
        "Yeh QR code suspicious hai. "
        "Risk score sixty out of hundred hai. "
        "Is QR code ke andar password verification "
        "aur urgent action jaise security indicators detect hue hain. "
        "Please is QR code ke saath interact mat kijiye "
        "jab tak iska destination independently verify na ho."
    )

    print()
    print(
        "JARVIS-style Hinglish voice test completed."
    )

    print("=" * 70)