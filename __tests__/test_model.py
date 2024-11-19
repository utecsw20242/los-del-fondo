import base64
import pytests
from modeloPlanos.function import apply_model  

def test_apply_model():
    
    img = np.zeros((100, 100, 3), dtype=np.uint8) 
    _, buffer = cv2.imencode('.png', img)
    test_image = base64.b64encode(buffer).decode("utf-8")

    # Llamar a la función apply_model
    matches, annotated_image = apply_model(test_image)

    # Verificar que se devuelven las clases como un diccionario
    assert isinstance(matches, dict), "El return no es un diccionario"
    
    # Verificar que cada clase tiene un valor inicial de 0
    for count in matches.values():
        assert isinstance(count, int), "El conteo no es un valor entero"
        assert count >= 0, "Los conteos de clases deben ser cero o mayores"

    # Verificar que la imagen anotada es una cadena en base64
    assert isinstance(annotated_image, str), "La imagen anotada no se encuentra en base64"
