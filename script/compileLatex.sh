cd $1
pdflatex $2".tex"
cp $2".pdf" $3
cd ..
rm -r $1
