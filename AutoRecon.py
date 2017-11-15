#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Automate the reconnaissance process, given a domain name.
"""
from __future__ import absolute_import, print_function
import sys
import socket
import subprocess
from time import sleep

def main():
    """Execute main code."""
    try:
        domain = sys.argv[1]
        ip_address = socket.gethostbyname(domain)
    except IndexError:
        print('Error: Domain name not specified.')
        sys.exit(1)
    except socket.gaierror:
        print('Error: Domain name cannot be resolved.')
        raise
    procs = []
    whois_cmd = ['whois', domain]
    dig_cmd = ['dig', '-t', 'txt', '+short', domain]
    wpscan_cmd = ['wpscan', '--force', '--update', '--url', domain]
    nmap_hosts_cmd = ['nmap', '-sn', ip_address + '/24']
    nmap_script_names = ('*-vuln*, banner, default, dns-brute,'
                         'dns-zone-transfer, ftp-*, hostmap-ip2hosts, http-config-backup,'
                         'http-cross*, http-devframework, http-enum, http-headers,'
                         'http-shellshock, http-sitemap-generator, http-waf-fingerprint,'
                         'http-xssed, smtp-*, ssl-*, version')
    nmap_full_cmd = ['nmap', '-sV', '-sS', '-A', '-Pn', '--script',
                     nmap_script_names, domain]
    cmds = {'TXT Records': dig_cmd, 'WHOIS Info': whois_cmd,
            'Active Hosts': nmap_hosts_cmd, 'Nmap Results': nmap_full_cmd,
            'WPScan': wpscan_cmd}

    def handle_proc(proc):
        """Handle subprocesses outputs."""
        separator = '=================='
        output = b''.join(proc.stdout.readlines()).decode('utf-8')
        print(proc.title)
        print(separator)
        print(output.strip())
        print(separator + '\n')
        procs.remove(proc)

    for title, cmd in cmds.items():
        try:
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            proc.title = title
            procs.append(proc)
        except OSError:
            print('%s >> Dependency error occurred.\n' % title)

    while True:
        for proc in procs:
            retcode = proc.poll()
            if retcode is not None:
                handle_proc(proc)
            else:
                continue
        if not procs:
            break
        else:
            sleep(1)

if __name__ == '__main__':
    print('This is gonna take quite a while; you better go make some coffee!\n')
    main()
