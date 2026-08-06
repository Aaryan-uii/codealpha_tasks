import random
import sys

HANGMAN_ASCII_STAGES = [
    # 0 wrong guesses
    """
   -----
   |   |
       |
       |
       |
       |
=========""",
    # 1 wrong guess
    """
   -----
   |   |
   O   |
       |
       |
       |
=========""",
    # 2 wrong guesses
    """
   -----
   |   |
   O   |
   |   |
       |
       |
=========""",
    # 3 wrong guesses
    """
   -----
   |   |
   O   |
  /|   |
       |
       |
=========""",
    # 4 wrong guesses
    """
   -----
   |   |
   O   |
  /|\\  |
       |
       |
=========""",
    # 5 wrong guesses
    """
   -----
   |   |
   O   |
  /|\\  |
  /    |
       |
=========""",
    # 6 wrong guesses (Game Over)
    """
   -----
   |   |
   O   |
  /|\\  |
  / \\  |
       |
========="""
]

CATEGORIES = {
    "1": {
        "name": "Standard Words",
        "words": ["python", "hangman", "programming", "developer", "internship"]
    },
    "2": {
        "name": "Web Technologies",
        "words": ["react", "typescript", "tailwind", "javascript", "html", "css", "vite", "node", "express", "database", "frontend", "backend"]
    },
    "3": {
        "name": "Computer Science",
        "words": ["algorithm", "recursion", "compiler", "variable", "function", "class", "object", "database", "array", "pointer", "stack", "queue"]
    }
}


def display_status(word, guessed_letters, wrong_guesses):
    stage_idx = min(len(wrong_guesses), len(HANGMAN_ASCII_STAGES) - 1)
    print("\n" + HANGMAN_ASCII_STAGES[stage_idx])
    
    # Word pattern display
    displayed_word = [letter.upper() if letter in guessed_letters else "_" for letter in word]
    print("\nWord: " + " ".join(displayed_word))
    
    # Guesses info
    wrong_str = ", ".join([l.upper() for l in sorted(wrong_guesses)]) if wrong_guesses else "None"
    print(f"Incorrect Guesses ({len(wrong_guesses)}/6): {wrong_str}")
    print("-" * 40)


def play_game():
    print("=" * 40)
    print("      WELCOME TO HANGMAN GAME")
    print("=" * 40)
    print("Choose a Category:")
    for key, cat in CATEGORIES.items():
        print(f" [{key}] {cat['name']}")
    
    cat_choice = input("\nSelect category number (default 1): ").strip()
    selected_cat = CATEGORIES.get(cat_choice, CATEGORIES["1"])
    secret_word = random.choice(selected_cat["words"]).lower()
    
    guessed_letters = set()
    wrong_guesses = set()
    max_wrong = 6
    
    print(f"\nCategory Selected: {selected_cat['name']}")
    print(f"Secret Word Length: {len(secret_word)} letters. Good luck!\n")
    
    while len(wrong_guesses) < max_wrong:
        display_status(secret_word, guessed_letters, wrong_guesses)
        
        # Check if entire word is guessed
        if all(letter in guessed_letters for letter in secret_word):
            print(f"\n🎉 CONGRATULATIONS! You guessed the word: '{secret_word.upper()}'!")
            return True
            
        guess = input("Guess a letter (or entire word): ").strip().lower()
        
        if not guess:
            print("Please enter a valid letter!")
            continue
            
        # Word guess
        if len(guess) > 1:
            if guess == secret_word:
                print(f"\n🎉 EXCELLENT! You guessed the full word: '{secret_word.upper()}'!")
                return True
            else:
                print(f"❌ '{guess.upper()}' is incorrect!")
                wrong_guesses.add(guess)
                continue
                
        # Single letter guess
        if not guess.isalpha():
            print("Please enter an alphabetic character!")
            continue
            
        if guess in guessed_letters or guess in wrong_guesses:
            print(f"⚠️ You already guessed '{guess.upper()}'. Try another letter!")
            continue
            
        if guess in secret_word:
            print(f"✅ Great guess! '{guess.upper()}' is in the word.")
            guessed_letters.add(guess)
        else:
            print(f"❌ Sorry, '{guess.upper()}' is NOT in the word.")
            wrong_guesses.add(guess)

    display_status(secret_word, guessed_letters, wrong_guesses)
    print(f"\n💀 GAME OVER! You ran out of guesses. The secret word was: '{secret_word.upper()}'")
    return False


def main():
    while True:
        play_game()
        print("\n" + "=" * 40)
        again = input("Do you want to play again? (y/n): ").strip().lower()
        if again not in ['y', 'yes']:
            print("Thanks for playing Hangman! Goodbye!")
            break


if __name__ == "__main__":
    main()
