import psycopg

def get_db_connection():
    return psycopg.connect(
        host='localhost',
        dbname='Threadwork',
        user='postgres',
        password='Chiron1!'
    )
