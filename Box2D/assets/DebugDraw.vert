uniform mat4 uCamera;
attribute vec4 aPosition;

void main()
{
    gl_Position = uCamera * aPosition;
}
