# ============================================================
# DEEPSHIELD-AI — VOICE ENGINE
# ============================================================

import pyttsx3
import threading


class VoiceEngine:

    def __init__(self):

        self.lock = threading.Lock()

        self.engine = pyttsx3.init()

        self.engine.setProperty("rate", 145)
        self.engine.setProperty("volume", 1.0)

        self._configure_voice()

        print("DeepShield Voice Engine initialized successfully.")

    # ========================================================
    # CONFIGURE VOICE
    # ========================================================

    def _configure_voice(self):

        voices = self.engine.getProperty("voices")

        if not voices:
            return

        selected_voice = None

        for voice in voices:

            voice_text = (
                f"{voice.id} {voice.name}"
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

    # ========================================================
    # SPEAK
    # ========================================================

    def speak(self, text):

        if not text:
            return

        with self.lock:

            try:

                print("\nDeepShield Assistant:")
                print(text)

                self.engine.stop()

                self.engine.say(text)
                self.engine.runAndWait()

            except Exception as error:

                print(f"Voice playback error: {error}")

                try:
                    self.engine.stop()
                except Exception:
                    pass

    # ========================================================
    # STOP
    # ========================================================

    def stop(self):

        with self.lock:

            try:

                self.engine.stop()

            except Exception:
                pass


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    voice = VoiceEngine()

    voice.speak(
        "DeepShield AI voice system is working correctly."
    )

    voice.speak(
        "This is the second voice test."
    )

    voice.speak(
        "This is the third voice test."
    )