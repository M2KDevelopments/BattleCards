import pygame

def main():
    
    # create window
    WIDTH = 800
    HEIGHT = 600
    win = pygame.display.set_mode((WIDTH, HEIGHT))
    print("Running Battle Cards")
    
    # main game loop
    run = True
    while run:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
          
    # close window            
    pygame.quit()


# main function entry point
if __name__ == "__main__":
    main()