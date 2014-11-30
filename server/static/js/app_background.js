var Utils =  {
    drawBackground : null
};

(function(){
    var width = gameModel.gameWidth;
    var height = gameModel.height;
    Utils.drawBackground = function(ctx){
        ctx.save();
        ctx.strokeStyle = "rgba(250,250,250,0.7)";
        ctx.beginPath();
        ctx.moveTo(0, height/2);
        ctx.lineTo(width, height/2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width/2, 0);
        ctx.lineTo(width/2, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0.5 * width * (1- (1 / Math.sqrt(2))), 0.5 * height * (1 - (1 / Math.sqrt(2))));
        ctx.lineTo(width - 0.5 * width * (1- (1 / Math.sqrt(2))), height - 0.5 * height * (1 - (1 / Math.sqrt(2))));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0.5 * width * (1- (1 / Math.sqrt(2))), height - 0.5 * height * (1 - (1 / Math.sqrt(2))));
        ctx.lineTo(width - 0.5 * width * (1- (1 / Math.sqrt(2))), 0.5 * height * (1 - (1 / Math.sqrt(2))));
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width/2,height/2,80, 1.5*Math.PI, 1.75*Math.PI);
        ctx.stroke();

        gameModel.drawString("45°", width/2 + 50, height/2 - 100, 0, "center", "white", false, "20px Verdana");
        gameModel.drawString("0°", width/2 + 20, 70, 0, "center", "white", false, "20px Verdana");
        ctx.restore();

    }
})();
