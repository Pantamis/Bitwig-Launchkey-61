 var ledstate = initArray(-1, 18);
var pendingLedstate = initArray(0, 18);

var selectedPage = 0;
var numParameterPages = 0;

var clipHasContent = initArray( false, 8 );
var clipIsPlaiyng = initArray( false, 8 );
var clipIsRecording = initArray( false, 8 );
var clipIsQueued = initArray( false, 8 );
var cursorScene=0

var canScrollUp = false
var canScrollDown = true

function mixColour(red, green, blink)
{
   return (blink ? 8 : 12) | red | (green * 16);
}

function updateOutputState()
{
  if(!control_launcher){
   for(var i=0; i<8; i++)
   {
      pendingLedstate[i] = (selectedPage == i)
         ? mixColour(3, 3, false)
         : (i < numParameterPages) ? mixColour(1, 1, false) : 0;

      var j = i + 9;

      pendingLedstate[j] = (modSourceStates.values[i])
         ? (blink ? mixColour(1, 3, false) : mixColour(0, 1, false))
         : 0;
   }
  }
  else
  {
    for(var i=0; i<9;i++)
    {
      if(!clipHasContent[i])
      {
        pendingLedstate[i]=mixColour(0,0,false)
      }
      else
      {
        if(clipIsPlaiyng[i])
        {
          pendingLedstate[i]=mixColour(0,3,false);
        }
         else if(clipIsQueued[i])
         {
           pendingLedstate[i]=(blink ? mixColour(1, 3, false) : mixColour(0, 1, false));
         }
         else if(clipIsRecording[i])
         {
           pendingLedstate[i]=mixColour(3,0,false);
         }
         else
         {
           pendingLedstate[i]=mixColour(3,3,false);
         }
       }
       var j = i+9;
       if(i==cursorScene)
       {
         pendingLedstate[j]=mixColour(0,3,false);
       }
       else
       {
         pendingLedstate[j]=mixColour(0,0,false);
       }
    }
  }
}

function flushOutputState()
{
   for(var i=0; i<9; i++)
   {
      if (pendingLedstate[i] != ledstate[i])
      {
         ledstate[i] = pendingLedstate[i];
         host.getMidiOutPort(1).sendMidi(0x90, 96 + i, ledstate[i]);
      }

      var j = i + 9;
      if (pendingLedstate[j] != ledstate[j])
      {
         ledstate[j] = pendingLedstate[j];
         host.getMidiOutPort(1).sendMidi(0x90, 112 + i, ledstate[j]);
      }
   }
}

/* Simple buffer array with setter. */

function BufferedElementArray(initialVal, count)
{
   this.values = initArray(initialVal, count);
}

/* Return a setter function for the specific index. */
BufferedElementArray.prototype.setter = function(index)
{
   var obj = this;

   return function(data)
   {
      obj.set(index, data);
   }
};

BufferedElementArray.prototype.set = function(index, data)
{
   this.values[index] = data;
};

var modSourceStates = new BufferedElementArray(false, 8);


function getClipObserverFunc( state )
{
	return function( scene, value )
	{
	switch( state )
	{		
		case 1:	// has content
		{
			clipHasContent[scene*8] = value;
			return;
		}
		case 2:	// is playing
		{
			clipIsPlaiyng[scene*8] = value;
		
			return;
		}	
		case 3:	// is recording
		{
			clipIsRecording[scene*8] = value;
			return;
		}
		case 4:	// is queued
		{
			clipIsQueued[scene*8] = value;
			return;
		}
		default:
			return;
	}
	}
}
function canScrollScenesUpOb( state )
{
	canScrollUp = state;
}

function canScrollScenesDownOb( state )
{
	canScrollDown = state;
}

