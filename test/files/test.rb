    args.each do |arg|
      define_method :"#{arg}=" do |new_value|              # define_method übergibt dem Block die übergeben Parameter
        instance_variable_set("@#{arg}".to_sym, new_value) # \- setter-methoden enden mit einem =
      end
    end
    
# Add the strings before and after around each parm and print
def surround(before, after, *items)
    items.each { |x| print before, x, after, "\n" }
end

surround('[', ']', 'this', 'that', 'the other')
print "\n"

surround('<', '>', 'Snakes', 'Turtles', 'Snails', 'Salamanders', 'Slugs',
        'Newts')
print "\n"

def boffo(a, b, c, d)
    print "a = #{a} b = #{b}, c = #{c}, d = #{d}\n"
end

# Use * to adapt between arrays and arguments
a1 = ['snack', 'fast', 'junk', 'pizza']
a2 = [4, 9]
boffo(*a1)
boffo(17, 3, *a2)

class MotorCycle  
    def initialize(make, color)  
    # Instance variables  
    @make = make  
    @color = color  
    end  
    def start_engine  
    if @engine_state  
        puts 'Engine is already Running'  
    else  
        @engine_state = true  
        puts 'Engine Idle'  
    end  
    end  
end  

loop do
  i += 2
  if i == 4
    next        # skip rest of the code in this iteration
  end
  puts i
  if i == 10
    break
  end
end

class Object # Monkey-Patching aller Klassen
  def self.getter *args # self ist hier Object, es wird eine Klassenmethode erzeugt
    args.each do |arg| # es wird durch alle Parameter iteriert
      define_method arg do # define_method(arg){block} erzeugt eine neue Methode des Names arg mit dem Inhalt block
        instance_variable_get("@#{arg}".to_sym) # instance_variable get gibt den Wert der Instanzvariablen des übergeben Namens zurück
      end                                       # \- "@#{arg}" hängt ein @ vor den Inhalt von arg, to_sym wandelt den String um in ein Symbol
    end
  end
  def self.setter *args # *args packt alle Parameter in ein Array namens args
    args.each do |arg|
      define_method :"#{arg}=" do |new_value|              # define_method übergibt dem Block die übergeben Parameter
        instance_variable_set("@#{arg}".to_sym, new_value) # \- setter-methoden enden mit einem =
      end
    end
  end
end

class PaarMit2
  def initialize links # Konstruktor
    @links = links # Instanzvariblen werden bei Erwähnung in einer beliebigen Methode automatisch erzeugt
    @rechts = 2
  end
  getter :links, :rechts
  setter :links
end

paar = PaarMit2.new(4) # new ruft immer den Konstruktor auf
paar.links       # => 4
paar.rechts      # => 2
paar.links = 9   # => 9
paar.links       # => 9
paar.rechts = 8  # => Fehler: NoMethodError (undefined method `rechts=')

# if @engine_state
if @engine_state  
    puts 'Engine is already Running'  
else  
    @engine_state = true  
    puts 'Engine Idle'  
end  

# loop do

loop do
  i += 2
  if i == 4
    next        # skip rest of the code in this iteration
  end
  puts i
  if i == 10
    break
  end
end 
