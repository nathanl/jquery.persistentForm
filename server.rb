require 'rubygems'
require 'bundler/setup'

Bundler.require(:default)

configure do
  mime_type :js, 'text/javascript'
  mime_type :css, 'text/css'
  mime_type :jpg, 'image/jpeg'
  mime_type :gif, 'image/gif'
  mime_type :png, 'image/png'
end

get '/' do
  File.read('index.html')
end

get '/SpecRunner.html' do
  File.read('SpecRunner.html')
end

get '/*' do
  filename = params[:splat].first
  return if filename.include?('favicon')
  logger.info "\n\nFound #{filename}? #{File.exist?(filename)}\n\n"
  send_file File.join(filename) 
end

post '/dummysave' do
  "I'll store it safely here in /dev/null."
end

post '/failwhale' do
  500 # pretend server error
end
