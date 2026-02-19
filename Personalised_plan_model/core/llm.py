import os
from langchain_google_genai import ChatGoogleGenerativeAI, HarmCategory, HarmBlockThreshold
# from langchain_groq import ChatGroq
from dotenv import load_dotenv
from config import gemini_model_name, model_temp

load_dotenv()

def get_gemini_model():
    """
    Returns a configured instance of llm model.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set in environment variables")

    return ChatGoogleGenerativeAI(
        model=gemini_model_name,
        temperature=model_temp,
        google_api_key=api_key,
        convert_system_message_to_human=True,
        # Add these safety settings to prevent blocks on medical/addiction context
        safety_settings={
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        }
    )

# def get_groq_model():
#     """
#     Returns a configured instance of groq llm model.
#     """
#     api_key = os.getenv("GROQ_API_KEY")
#     if not api_key:
#         raise ValueError("GROQ_API_KEY is not set in environment variables")
#
#     return ChatGroq(
#         model=groq_model_name,
#         temperature=model_temp,
#         google_api_key=api_key,
#         convert_system_message_to_human=True,
#         # Add these safety settings to prevent blocks on medical/addiction context
#         safety_settings={
#             HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
#             HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
#             HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
#             HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
#         }
#     )