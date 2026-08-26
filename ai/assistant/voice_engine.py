# ============================================================
# DEEPSHIELD-AI — VOICE ENGINE
# ============================================================

import pyttsx3


# ============================================================
# VOICE ENGINE
# ============================================================

class VoiceEngine:

    def __init__(self):

        self.engine = pyttsx3.init()

        # ----------------------------------------------------
        # Voice configuration
        # ----------------------------------------------------

        self.engine.setProperty(
            "rate",
            145
        )

        self.engine.setProperty(
            "volume",
            1.0
        )

        self._configure_voice()

    # --------------------------------------------------------
    # Configure available voice
    # --------------------------------------------------------

    def _configure_voice(self):

        voices = self.engine.getProperty(
            "voices"
        )

        if not voices:
            return

        # Prefer an English voice when available

        selected_voice = None

        for voice in voices:

            voice_text = (
                f"{voice.id} "
                f"{voice.name}"
            ).lower()

            if "zira" in voice_text:
                selected_voice = voice.id
                break

        if selected_voice is None:
            selected_voice = voices[0].id

        self.engine.setProperty(
            "voice",
            selected_voice
        )

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
    # Stop voice
    # --------------------------------------------------------

    def stop(self):

        self.engine.stop()


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — VOICE ENGINE")
    print("=" * 70)

    voice = VoiceEngine()

    voice.speak(
        "Hello. I am the DeepShield security assistant. "
        "Your multimodal security analysis is ready."
    )

    print()
    print(
        "Voice test completed."
    )

    print("=" * 70)