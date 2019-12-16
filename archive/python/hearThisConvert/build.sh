 cython main.pyx --embed
 gcc -Os -I /usr/include/python3.5m -o convertHereThis main.c -lpython3.5m -lpthread -lm -lutil -ldl