using System;
using System.Threading;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.Drawing.Imaging;



namespace WindowsApplication1
{


    public partial class Form1 : Form
    {

        static Object locker = new object();
        int pixel_w;
        int pixel_h;
        int zoomRatio = 7;
        public bool drawSprite = false;

        int bigSquareSize;
        bool stopRequired = false;

        double x0;
        double y0;
        double side;

        Bitmap sprite;
        Bitmap msetImage;
        Bitmap subImage1;
        Bitmap subImage2;
        Bitmap subImage3;
        Bitmap subImage4;
        Thread t1, t2, t3, t4;
        public delegate void DrawingDelegate(); 

        static Color backgroundColor = Color.DarkBlue;
        int backgroundColorInt = backgroundColor.ToArgb();
        MSet fractalSet1;
        MSet fractalSet2;
        MSet fractalSet3;
        MSet fractalSet4;

        int spriteWidth;
        int spriteHeight;
        int mousex;
        int mousey;
        public bool nowFinished = true;

        // used for multithreading
        //public delegate void DrawingDelegate(int grid);
    
        
        public Form1()
        {
            InitializeComponent();
            fractalSet1 = new MSet();
            fractalSet2 = new MSet();
            fractalSet3 = new MSet();
            fractalSet4 = new MSet();
        }

       
         /* Calculates and returns the image.  Halts the calculation and returns       */ 
         /* if the application is stopped during the calculation.                      */

        private void calculateMSETImage(int subImageNumber, Bitmap subImage, MSet fractalSet)
        {
            
            int step = 8;
            int pixelColor;
            for (int pass = 0; pass < step; pass++)
            {
                for (int j = (subImageNumber - 1) * pixel_h / 4 + pass; j < subImageNumber * pixel_h / 4; j += step)
                {
                    double y = y0 + j * side / bigSquareSize;
                    for (int i = 0; i < pixel_w; i++)
                    {
                        double x = x0 + i * side / bigSquareSize;
                        int subIndex;
                        Math.DivRem(j, pixel_h / 4, out subIndex);

                        lock (subImage)
                        {
                            pixelColor = subImage.GetPixel(i, subIndex).ToArgb();

                        }
                        if (pixelColor == backgroundColorInt)
                        {
                            lock (fractalSet)
                                fractalSet.setColor(i, subIndex, bigSquareSize, x, y, side, subImage);
                        }
                    }

                    if (stopRequired == true)
                        return;
                }
            }
        }

        /************************************/
        /*      Mouse Handling              */
        /************************************/

        private void pictureBoxMset_MouseDown(object sender, MouseEventArgs e)
        {
            drawSprite = true;
            
            mousex = e.X - spriteWidth / 2;
            mousey = e.Y - spriteHeight / 2;

            double newx = x0 + side / bigSquareSize * mousex;
            double newy = y0 + side / bigSquareSize * mousey;
            double newSide = side / zoomRatio;

            if (radioButtonMset.Checked)
            {
                textBoxCx.Text = newx.ToString();
                textBoxCy.Text = newy.ToString();
                textBoxSize.Text = newSide.ToString();
                using (Graphics g = this.pictureBoxMset.CreateGraphics())
                {
                    lock (subImage1)
                        g.DrawImage(subImage1, 0, 0);
                    lock (subImage2)
                        g.DrawImage(subImage2, 0, pixel_h / 4);
                    lock (subImage3)
                        g.DrawImage(subImage3, 0, 2 * pixel_h / 4);
                    lock (subImage4)
                        g.DrawImage(subImage4, 0, 3 * pixel_h / 4);
                        g.DrawImage(sprite, mousex, mousey);
                }
            }
        }

        private void pictureBoxMset_MouseMove(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                drawSprite = true;

                mousex = e.X - spriteWidth / 2;
                mousey = e.Y - spriteHeight / 2;

                double newx = x0 + side / bigSquareSize * mousex;
                double newy = y0 + side / bigSquareSize * mousey;
                double newSide = side / zoomRatio;

                if (radioButtonMset.Checked)
                {
                    textBoxCx.Text = newx.ToString();
                    textBoxCy.Text = newy.ToString();
                    textBoxSize.Text = newSide.ToString();
                    using (Graphics g = this.pictureBoxMset.CreateGraphics())
                    {
                        lock (subImage1)
                            g.DrawImage(subImage1, 0, 0);
                        lock (subImage2)
                            g.DrawImage(subImage2, 0, pixel_h / 4);
                        lock (subImage3)
                            g.DrawImage(subImage3, 0, 2 * pixel_h / 4);
                        lock (subImage4)
                            g.DrawImage(subImage4, 0, 3 * pixel_h / 4);
                            g.DrawImage(sprite, mousex, mousey);
                    }
                }

            }
        }


        /************************************/
        /*      Button Handling             */
        /************************************/

        
        void buttonZoomIn_Click(object sender, EventArgs e)
        {
  
            stopRequired = true;            
            drawSprite = false;
            Thread.Sleep(10);
            stopRequired = false;
          
            /************************************/
            /*      Initialises the main Panel  */
            /************************************/

            pixel_w = this.pictureBoxMset.Width;
            pixel_h = 4*(this.pictureBoxMset.Height/4);
            
            bigSquareSize = Math.Max(pixel_w, pixel_h);

            msetImage = new Bitmap(pixel_w, pixel_h, PixelFormat.Format32bppArgb);
            subImage1 = new Bitmap(pixel_w, pixel_h/4, PixelFormat.Format32bppArgb) ;
            subImage2 = new Bitmap(pixel_w, pixel_h/4, PixelFormat.Format32bppArgb) ;
            subImage3 = new Bitmap(pixel_w, pixel_h/4, PixelFormat.Format32bppArgb) ;
            subImage4 = new Bitmap(pixel_w, pixel_h/4, PixelFormat.Format32bppArgb) ;
          
            using (Graphics g = Graphics.FromImage(subImage1))
            {
                Brush b1 = new SolidBrush(backgroundColor);
                g.FillRectangle(b1, 0, 0, pixel_w, pixel_h/4);
                pictureBoxMset.CreateGraphics().DrawImage(subImage1, 0, 0);
            }

            using (Graphics g = Graphics.FromImage(subImage2))
            {
                Brush b1 = new SolidBrush(backgroundColor);
                g.FillRectangle(b1, 0, 0, pixel_w, pixel_h/4);
                pictureBoxMset.CreateGraphics().DrawImage(subImage2, 0, pixel_h / 4);
            }

            using (Graphics g = Graphics.FromImage(subImage3))
            {
                Brush b1 = new SolidBrush(backgroundColor);
                g.FillRectangle(b1, 0, 0, pixel_w, pixel_h/4);
                pictureBoxMset.CreateGraphics().DrawImage(subImage3, 0, 2 * pixel_h / 4);
            }


            using (Graphics g = Graphics.FromImage(subImage4))
            {
                Brush b1 = new SolidBrush(backgroundColor);
                g.FillRectangle(b1, 0, 0, pixel_w, pixel_h/4);
                pictureBoxMset.CreateGraphics().DrawImage(subImage4, 0, 3 * pixel_h / 4);
            }

            /************************************/
            /*      Initialises the Sprite      */
            /************************************/

            spriteWidth = pixel_w / zoomRatio;
            spriteHeight = pixel_h / zoomRatio;

            sprite = new Bitmap(spriteWidth, spriteHeight, PixelFormat.Format32bppArgb);

            using (Graphics g = Graphics.FromImage(sprite))
            {
                Pen spritePen = new Pen(Color.FromArgb(255, 0, 255, 0));
                Brush spriteBrush = new SolidBrush(Color.FromArgb(70, 255, 255, 255));

                g.FillRectangle(spriteBrush, 0, 0, spriteWidth, spriteHeight);
                g.DrawRectangle(spritePen, 0, 0, spriteWidth - 1, spriteHeight - 1);

                spritePen.Dispose();
                spriteBrush.Dispose();
            }

            if (radioButtonMset.Checked)
            {

                fractalSet1.maxiter = int.Parse(textBoxIter.Text);
                fractalSet1.threshold = int.Parse(textBoxBrush.Text);
                
                fractalSet2.maxiter = int.Parse(textBoxIter.Text);
                fractalSet2.threshold = int.Parse(textBoxBrush.Text);
                
                fractalSet3.maxiter = int.Parse(textBoxIter.Text);
                fractalSet3.threshold = int.Parse(textBoxBrush.Text);
                
                fractalSet4.maxiter = int.Parse(textBoxIter.Text);
                fractalSet4.threshold = int.Parse(textBoxBrush.Text);
                
                
                x0 = double.Parse(textBoxCx.Text);
                y0 = double.Parse(textBoxCy.Text);
                side = double.Parse(textBoxSize.Text);

        
                t1 = new Thread(delegate() { calculateMSETImage(1, subImage1, fractalSet1); });
                t1.IsBackground = true;
                t1.Start();

                t2 = new Thread(delegate() { calculateMSETImage(2, subImage2, fractalSet2); });
                t2.IsBackground = true;
                t2.Start();
      
                t3 = new Thread(delegate() { calculateMSETImage(3, subImage3, fractalSet3); });
                t3.IsBackground = true;
                t3.Start();
                
                t4 = new Thread(delegate() { calculateMSETImage(4, subImage4, fractalSet4); });
                t4.IsBackground = true;
                t4.Start();
             
                DrawingDelegate drawingThread = new DrawingDelegate(PaintImage);
                drawingThread.BeginInvoke(null, null);

                
            }

        }


        private void PaintImage()
        {
            if (this.InvokeRequired == false)
            {
                do
                {
                    Thread.Sleep(100);
                    Application.DoEvents();
                    using(Graphics g = Graphics.FromImage(msetImage))
                    //using (Graphics g = this.pictureBoxMset.CreateGraphics())
                    {
                        lock (subImage1)
                            g.DrawImage(subImage1, 0, 0);
                        lock (subImage2)
                            g.DrawImage(subImage2, 0, pixel_h / 4);
                        lock (subImage3)
                            g.DrawImage(subImage3, 0, 2 * pixel_h / 4);
                        lock (subImage4)
                            g.DrawImage(subImage4, 0, 3 * pixel_h / 4);
                        if (drawSprite == true)
                            g.DrawImage(sprite, mousex, mousey);
                    }
                    using (Graphics g1 = this.pictureBoxMset.CreateGraphics())
                    {
                        g1.DrawImage(msetImage, 0, 0);
                    }
                } while (t1.IsAlive || t2.IsAlive || t3.IsAlive || t4.IsAlive);

            }
            else
            {
                this.Invoke(new DrawingDelegate(PaintImage));
            }
            
        }
  


        private void Reset_Click(object sender, EventArgs e)
        {
            double newx = -2.5;
            double newy = -1.5;
            double newSide = 4;

            if (radioButtonMset.Checked)
            {
                textBoxCx.Text = newx.ToString();
                textBoxCy.Text = newy.ToString();
                textBoxSize.Text = newSide.ToString();
            }
        }

        private void Save_Click(object sender, EventArgs e)
        {       
            SaveFileDialog filedialog = new SaveFileDialog();
            filedialog.InitialDirectory = "C:\\Documents and Settings\\Christophe\\My Documents\\Visual Studio 2005\\Projects\\WindowsApplication1\\WindowsApplication1";
            filedialog.Filter = "image (*.bmp)|*.bmp";
            filedialog.ShowDialog();
            if (filedialog.FileName != "")
                this.msetImage.Save(filedialog.FileName,ImageFormat.Bmp);
        }

        private void pictureBoxMset_Click(object sender, EventArgs e)
        {

        }
        



    }

}



