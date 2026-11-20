import win32com.client
import threading


class VoiceEngine:

    def __init__(self):
        self.lock = threading.Lock()
        self.speaker = win32com.client.Dispatch("SAPI.SpVoice")

        self.speaker.Rate = 0
        self.speaker.Volume = 100

        print("DeepShield SAPI Voice Engine initialized successfully.")

    def speak(self, text):
        if not text:
            return

        with self.lock:
            try:
                print("\nDeepShield Assistant:")
                print(text)

                self.speaker.Speak(text)

            except Exception as error:
                print(f"Voice playback error: {error}")

    def stop(self):
        with self.lock:
            try:
                self.speaker.Speak(
                    "",
                    3  # Purge currently queued speech
                )
            except Exception:
                pass


if __name__ == "__main__":

    voice = VoiceEngine()

    voice.speak("DeepShield AI voice system is working correctly.")
    voice.speak("This is the second voice test.")
    voice.speak("This is the third voice test.")
    voice.speak("All consecutive voice playback tests are complete.")