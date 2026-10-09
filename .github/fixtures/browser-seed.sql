INSERT INTO files (path,parent_path,name,is_directory,size) VALUES
  ('/var','/','var',true,0),
  ('/var/log','/var','log',true,0),
  ('/var/log/diagnostic-e2e.log','/var/log','diagnostic-e2e.log',false,256);

INSERT INTO logs (file_path,line,line_number,timestamp,level) VALUES
  ('/var/log/diagnostic-e2e.log','ERROR canary storage connection lost',1,now()-interval '90 seconds','error'),
  ('/var/log/diagnostic-e2e.log','INFO storage connection restored',2,now()-interval '60 seconds','info');

INSERT INTO network_packets (time,protocol,src_ip,dst_ip,src_port,dst_port,length,payload_size,tcp_flags) VALUES
  (now()-interval '30 seconds','TCP','10.10.10.1','10.10.10.2',45123,443,128,74,'SYN'),
  (now()-interval '20 seconds','UDP','10.10.10.3','10.10.10.4',51515,53,96,68,'');
