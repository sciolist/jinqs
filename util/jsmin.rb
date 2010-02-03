#!/usr/bin/ruby
# jsmin.rb 2010-02-02
# Author: Jonas Pihlström
# Modification of Uldzislau's por of jsmin.c to run in a class, and
# using string streams. Same license applies.
#
# jsmin.rb 2007-07-20
# Author: Uladzislau Latynski
# This work is a translation from C to Ruby of jsmin.c published by
# Douglas Crockford.  Permission is hereby granted to use the Ruby
# version under the same conditions as the jsmin.c on which it is
# based.
#
# /* jsmin.c
#    2003-04-21
#
# Copyright (c) 2002 Douglas Crockford  (www.crockford.com)
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
# of the Software, and to permit persons to whom the Software is furnished to do
# so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# The Software shall be used for Good, not Evil.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.


class JSMin
	def self.minify sources
	    JSMin.new(sources).minify
	end
	
	def initialize sources = []
		@in = StringIO.new
		add_file sources
	end
	
	def add_file obj
	    if obj.is_a? Array
	        obj.each{|f|add_file(f)}
		elsif obj.respond_to? :read
			add obj.read
		else
			add File.read(obj)
		end
	end
	
	def add obj
		if obj.respond_to? :read
			@in.write obj.read
		else
			@in.write obj
		end
	end
	
	def minify
		@in.rewind
		@out = StringIO.new
		inner_read
		@in.rewind
		@out.rewind
		output = @out.read
		@out.close
		output
	end
	
	private
    EOF = -1
    @theA = ""
    @theB = ""

	def get()
		c = @in.getc
		return EOF if(!c)
		c = c.chr
		return c if (c >= " " || c == "\n" || c.unpack("c") == EOF)
		return "\n" if (c == "\r")
		return " "
	end
	
	def peek()
        lookaheadChar = @in.getc
        @in.ungetc(lookaheadChar)
        return lookaheadChar.chr
    end
    
    def mynext()
        c = get
        if (c == "/")
            if(peek == "/")
                while(true)
                    c = get
                    if (c <= "\n")
                    return c
                    end
                end
            end
            if(peek == "*")
                get
                while(true)
                    case get
                    when "*"
                       if (peek == "/")
                            get
                            return " "
                        end
                    when EOF
                        raise "Unterminated comment"
                    end
                end
            end
        end
        return c
    end
    
    def isAlphanum(c)
       return false if !c || c == EOF
       return ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') ||
               (c >= 'A' && c <= 'Z') || c == '_' || c == '$' ||
               c == '\\' || c[0] > 126)
    end
    
    def action(a)
        if(a==1)
            @out.write @theA
        end
        if(a==1 || a==2)
            @theA = @theB
            if (@theA == "\'" || @theA == "\"")
                while (true)
                    @out.write @theA
                    @theA = get
                    break if (@theA == @theB)
                    raise "Unterminated string literal" if (@theA <= "\n")
                    if (@theA == "\\")
                        @out.write @theA
                        @theA = get
                    end
                end
            end
        end
        if(a==1 || a==2 || a==3)
            @theB = mynext
            if (@theB == "/" && (@theA == "(" || @theA == "," || @theA == "=" ||
                                 @theA == ":" || @theA == "[" || @theA == "!" ||
                                 @theA == "&" || @theA == "|" || @theA == "?" ||
                                 @theA == "{" || @theA == "}" || @theA == ";" ||
                                 @theA == "\n"))
                @out.write @theA
                @out.write @theB
                while (true)
                    @theA = get
                    if (@theA == "/")
                        break
                    elsif (@theA == "\\")
                        @out.write @theA
                        @theA = get
                    elsif (@theA <= "\n")
                        raise "Unterminated RegExp Literal"
                    end
                    @out.write @theA
                end
                @theB = mynext
            end
        end
    end
    
    def inner_read
        @theA = "\n"
        action(3)
        while (@theA != EOF)
            case @theA
            when " "
                if (isAlphanum(@theB))
                    action(1)
                else
                    action(2)
                end
            when "\n"
                case (@theB)
                when "{","[","(","+","-"
                    action(1)
                when " "
                    action(3)
                else
                    if (isAlphanum(@theB))
                        action(1)
                    else
                        action(2)
                    end
                end
            else
                case (@theB)
                when " "
                    if (isAlphanum(@theA))
                        action(1)
                    else
                        action(3)
                    end
                when "\n"
                    case (@theA)
                    when "}","]",")","+","-","\"","\\", "'", '"'
                        action(1)
                    else
                        if (isAlphanum(@theA))
                            action(1)
                        else
                            action(3)
                        end
                    end
                else
                    action(1)
                end
            end
        end
    end
end
